const Auth = {
  isLoggedIn() {
    return localStorage.getItem("user_id") !== null;
  },

  getUser() {
    return {
      id: localStorage.getItem("user_id"),
      name: localStorage.getItem("user_name"),
      role: localStorage.getItem("user_role"),
      posyandu: localStorage.getItem("user_posyandu"),
    };
  },

  async login(username, password) {
    try {
      const allUsers = await db.query("SELECT * FROM users");

      if (!allUsers || allUsers.length === 0) {
        alert("Tabel users kosong atau gagal dimuat.");
        return false;
      }

      const inputUser = String(username).toLowerCase().trim();
      const inputPass = String(password).trim();

      const user = allUsers.find((u) => {
        // Find column holding username (handle variable casing)
        const uKey = Object.keys(u).find((k) => k.toLowerCase() === "username");
        return uKey && String(u[uKey]).toLowerCase().trim() === inputUser;
      });

      if (user) {
        // Find column holding password (handle variable casing)
        const pKey = Object.keys(user).find(
          (k) => k.toLowerCase() === "password",
        );

        if (!pKey) {
          alert(
            "Kolom 'password' tidak ditemukan di database. Cek header tabel users.",
          );
          return false;
        }

        const dbPass = String(user[pKey]).trim();

        if (dbPass === inputPass) {
          localStorage.setItem("user_id", user.id);
          localStorage.setItem("user_name", user.nama_lengkap || user.username);
          localStorage.setItem("user_role", user.role);
          localStorage.setItem("user_posyandu", user.posyandu || "");

          db.log("LOGIN", `User ${user.username} berhasil masuk.`);
          return true;
        } else {
          alert("Username atau Password salah.");
          console.warn(`Password mismatch for user: ${username}`);
        }
      } else {
        alert("Username atau Password salah.");
      }
    } catch (e) {
      console.error("Login Error:", e);
      alert("Terjadi kesalahan sistem saat login: " + e.message);
    }
    return false;
  },

  logout() {
    localStorage.clear();
    window.location.hash = "#/login";
  },
};
