class Database {
    constructor() {
        this.apiUrl = CONFIG.GOOGLE_SCRIPT_URL;
        this.lastInsertId = null;
    }

    async execute(query, params = []) {
        document.getElementById('loader').style.display = 'flex';
        const maxRetries = 2;
        let attempt = 0;
        
        while (attempt <= maxRetries) {
            try {
                const response = await fetch(this.apiUrl, {
                    method: 'POST',
                    body: JSON.stringify({
                        action: 'execute',
                        query: query,
                        params: params
                    })
                });
                const result = await response.json();
                document.getElementById('loader').style.display = 'none';
                return result;
            } catch (error) {
                attempt++;
                console.warn(`DB Execute failed (Attempt ${attempt}/${maxRetries + 1}):`, error);
                
                if (attempt > maxRetries) {
                    document.getElementById('loader').style.display = 'none';
                    return { status: 'error', message: 'Connection Failed: ' + error.message };
                }
                // Wait 1s before retry
                await new Promise(r => setTimeout(r, 1000));
            }
        }
    }

    // --- FITUR OPTIMASI: BATCH QUERY ---
    async batch(queries) {
        document.getElementById('loader').style.display = 'flex';
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'batch',
                    queries: queries // Array of {query, params}
                })
            });
            const result = await response.json();
            document.getElementById('loader').style.display = 'none';
            return result.status === 'success' ? result.results : [];
        } catch (error) {
            document.getElementById('loader').style.display = 'none';
            return [];
        }
    }


    async query(query, params = []) {
        const res = await this.execute(query, params);
        return (res && res.data) ? res.data : [];
    }

    async fetchColumn(query, params = []) {
        const data = await this.query(query, params);
        if (data && data.length > 0) {
            return Object.values(data[0])[0];
        }
        return null;
    }

    async fetch(query, params = []) {
        const data = await this.query(query, params);
        return data && data.length > 0 ? data[0] : null;
    }

    async log(action, details = '') {
        const user = localStorage.getItem('user_name') || 'Guest';
        // Fire and forget - don't await to not block UI
        this.execute("INSERT INTO activity_logs (username, action, details) VALUES (?, ?, ?)", [user, action, details]);
    }
}

const db = new Database();
