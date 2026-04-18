# ft_transcendence

## Setup

### Prerequisites
- Docker or Podman installed
- make

### Installation

1. Clone the repository
```bash
git clone <repo_url>
cd ft_transcendance
```

2. Create the secrets folder and files
```bash
mkdir -p secrets
echo "your_password" > secrets/db_password.txt
echo "your_root_password" > secrets/db_root_password.txt
echo "your_wp_admin_password" > secrets/wp_admin_password.txt
echo "your_wp_user_password" > secrets/wp_user_password.txt
```

3. Run the project
```bash
make
```

### Notes
- The `secrets/` folder is ignored by Git and must be created manually
- Vault will automatically unseal and distribute secrets to services on startup
- ModSecurity WAF is active on nginx and blocks SQLi, XSS, and path traversal attacks
