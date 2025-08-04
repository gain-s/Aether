#!/bin/bash
# start-dev.sh: Controlled startup with health-bound staging

GREEN="\033[0;32m"
RED="\033[0;31m"
NC="\033[0m"

BACKEND_URL="http://localhost:3000"
FRONTEND_URL="http://localhost:5173"

# ─── Kill Port Occupants
kill_port() {
    local port=$1
    if lsof -ti tcp:$port >/dev/null; then
        echo -e "${RED}Killing process on port $port...${NC}"
        kill -9 $(lsof -ti tcp:$port)
    fi
}

# ─── Wait for Health Gate
await_health() {
    local url=$1
    local is_frontend=0
    local max_attempts=25
    local attempts=0

    # Check if this is frontend URL
    if [[ "$url" == "$FRONTEND_URL" ]]; then
        is_frontend=1
        echo -e "${GREEN}Awaiting frontend at ${url}...${NC}"
    else
        echo -e "${GREEN}Awaiting health check at ${url}/health...${NC}"
    fi
    while true; do
        if [[ $is_frontend -eq 1 ]]; then
            # For frontend, just check if we get a 200 OK response
            status_code=$(curl -s -o /dev/null -w "%{http_code}" "$url")
            if [[ "$status_code" == "200" ]]; then
                echo -e "${GREEN}Frontend is accessible${NC}"
                break
            else
                echo -e "${RED}Frontend not ready (HTTP $status_code)${NC}"
            fi
        else
            # Get health status for backend
            response=$(curl -s "${url}/health")
            
            # Verify we got JSON response
            if ! [[ "$response" =~ ^\{.*\}$ ]]; then
                echo -e "${RED}Invalid response format. Got: $response${NC}"
                ((attempts++))
                if [[ $attempts -ge $max_attempts ]]; then
                    echo -e "${RED}Health check failed: Invalid response format${NC}"
                    exit 1
                fi
                sleep 2
                continue
            fi

            # Get HTTP status code first
            http_code=$(curl -s -o /dev/null -w "%{http_code}" "${url}/health")
            if [[ "$http_code" != "200" ]]; then
                echo -e "${RED}Backend returned HTTP ${http_code}${NC}"
                ((attempts++))
                if [[ $attempts -ge $max_attempts ]]; then
                    echo -e "${RED}Health check failed: Server returning ${http_code}${NC}"
                    exit 1
                fi
                sleep 2
                continue
            fi

            # Parse status components
            status=$(echo "$response" | grep -o '"status":"[^"]*"' | cut -d':' -f2 | tr -d '"')
            db_status=$(echo "$response" | grep -o '"db":"[^"]*"' | cut -d':' -f2 | tr -d '"')
            puppeteer_status=$(echo "$response" | grep -o '"puppeteer":"[^"]*"' | cut -d':' -f2 | tr -d '"')

            echo -e "${RED}Health check status [$((attempts + 1))/${max_attempts}] - Status: \"$status\", DB: \"$db_status\", Puppeteer: \"$puppeteer_status\"${NC}"

            # For backend, check all components
            if [[ "$status" == "ok" && "$db_status" == "sqlite3" && "$puppeteer_status" == "ok" ]]; then
                echo -e "${GREEN}Health check passed: All systems ready${NC}"
                break
            fi

            ((attempts++))
            if [[ $attempts -ge $max_attempts ]]; then
                echo -e "${RED}Health check timeout at $url. Aborting.${NC}"
                exit 1
            fi

            sleep 2
        fi
    done
}

# ─── Start Services
start_backend() {
    echo -e "${GREEN}→ Installing backend dependencies...${NC}"
    (cd server && npm install) || {
        echo -e "${RED}Failed to install backend dependencies${NC}"
        exit 1
    }
    
    echo -e "${GREEN}→ Starting backend...${NC}"
    # Start with debug logging enabled
    (cd server && DEBUG=* npm run dev 2>&1 | tee /tmp/backend.log) &
    BACKEND_PID=$!
    # Give the backend a moment to start
    sleep 5
    # Check if backend started successfully
    if ! ps -p $BACKEND_PID > /dev/null; then
        echo -e "${RED}Backend failed to start. Check /tmp/backend.log for details${NC}"
        cat /tmp/backend.log
        exit 1
    fi
}

start_frontend() {
    echo -e "${GREEN}→ Installing frontend dependencies...${NC}"
    (cd client && npm install) || {
        echo -e "${RED}Failed to install frontend dependencies${NC}"
        exit 1
    }
    
    echo -e "${GREEN}→ Starting frontend...${NC}"
    (cd client && npm run dev) &
    FRONTEND_PID=$!
}

# ─── Init Workflow
kill_port 3000
kill_port 5173

echo -e "${GREEN}🚧 Building shared package...${NC}"
(cd shared && npm install && npm run build)

# ─── Launch and Enforce Staging
start_backend
await_health "$BACKEND_URL"

start_frontend
await_health "$FRONTEND_URL"

echo -e "${GREEN}✅ All services are up and healthy.${NC}"
wait
