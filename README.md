# cohort-9-dotnet-8779-muhammad

Cohort 9 — .NET Fullstack (.NET + ReactJS) assignment for Muhammad Hamza Arif

## Running the Application

Follow the steps below in order to set up and run the application locally.

### 1. Prerequisites

Make sure the following are installed:

* .NET 10 SDK
* Node.js and npm
* SQL Server
* SQL Server Management Studio (SSMS)
* Git

### 2. Clone the Repository

Clone the repository and navigate into the project:

```powershell
git clone <repository-url>
cd cohort-9-dotnet-8779-muhammad
```

### 3. Configure the Backend

Open the solution in Visual Studio.

Before running the application, make sure:

* `TaskManagement.API` is selected as the **Startup Project**.
* The **HTTPS** launch profile is selected, **not HTTP**.

The application is configured to run on:

```text
https://localhost:7072
```

### 4. Configure Backend User Secrets

The application uses .NET User Secrets for sensitive configuration such as the JWT key and database connection string.

From the repository root, initialize User Secrets for the API project:

```powershell
dotnet user-secrets init --project TaskManagement\TaskManagement.API.csproj
```

Set the required secrets according to your local SQL Server configuration.

For example:

```powershell
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "<your-sql-server-connection-string>" --project TaskManagement
```

Set a JWT key of at least 32 UTF-8 bytes:

```powershell
dotnet user-secrets set "Jwt:Key" "<your-development-jwt-key-at-least-32-characters>" --project TaskManagement
```

You can verify the configured secrets with:

```powershell
dotnet user-secrets list --project TaskManagement\TaskManagement.API.csproj
```

> Do not commit your actual User Secrets or other sensitive credentials to the repository.

### 5. Restore and Build the Backend

From the repository root, run:

```powershell
dotnet restore
```

Then:

```powershell
dotnet build
```

Make sure the build completes successfully.

### 6. Apply Entity Framework Migrations

From the repository root, create/update the database using the existing EF Core migrations:

```powershell
dotnet ef database update --project TaskManagement.Infrastructure --startup-project TaskManagement
```

This creates the required database schema in your configured SQL Server database.

### 7. Import Sample Data

After the migrations have successfully completed, open:

```text
data/script.sql
```

Run the SQL script using SQL Server Management Studio (SSMS) against the newly created Task Management database.

The script contains sample data, including an administrator account and regular users/tasks, allowing you to immediately explore the application's functionality.

#### Admin Account

```text
Email: admin@example.com
Password: @IamAdmin123.
```

#### Regular User Accounts

Regular user credentials follow this exact format:

```text
Email: iam<first-name>@example.com
Password: @Iam<FirstName>123
```

For example, for Jane:

```text
Email: iamjane@example.com
Password: @IamJane123
```

Use the same pattern for the other sample users included in `data/script.sql`.

> Make sure the migrations have been applied **before** running `data/script.sql`.

### 8. Run the Backend

In Visual Studio, ensure that:

```text
Startup Project: TaskManagement.API
Launch Profile: https
```

Then run the application.

Alternatively, from the repository root:

```powershell
dotnet run --project TaskManagement
```

The API should be available at:

```text
https://localhost:7072
```

Swagger should be available at:

```text
https://localhost:7072/swagger
```

### 9. Configure the Frontend

Open a **new terminal** and navigate to the frontend:

```powershell
cd frontend\task-management-ui
```

Create the local environment file from the provided example:

```powershell
Copy-Item .env.example .env
```

The `.env` file should contain:

```env
VITE_API_BASE_URL=https://localhost:7072/api
```

> If the backend is configured to run on a different port, update `VITE_API_BASE_URL` accordingly. The frontend and backend do not need to use the same port because they are separate applications.

### 10. Install Frontend Dependencies

From:

```text
frontend/task-management-ui
```

run:

```powershell
npm install
```

### 11. Run the Frontend

Start the React application:

```powershell
npm run dev
```

The frontend should be available at the URL displayed by Vite, normally:

```text
http://localhost:8443
```

### 12. Test the Application

Once both the backend and frontend are running:

1. Open the frontend in your browser.
2. Log in using one of the sample accounts from `data/script.sql`.
3. Use the **Admin** account to explore administrative functionality.
4. Use a **Regular User** account to explore regular-user functionality.
5. Alternatively, register a new regular user through the application.

### Quick Setup Summary

For future reference, the essential setup sequence is:

```powershell
git clone <repository-url>
cd cohort-9-dotnet-8779-muhammad

dotnet restore
dotnet build

dotnet user-secrets init --project TaskManagement\TaskManagement.API.csproj
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "<your-connection-string>" --project TaskManagement
dotnet user-secrets set "Jwt:Key" "<your-development-jwt-key>" --project TaskManagement

dotnet ef database update --project TaskManagement.Infrastructure --startup-project TaskManagement
```

Then:

1. Run `data/script.sql` in SSMS to import the sample data.
2. Start `TaskManagement.API` using the **HTTPS** profile in Visual Studio.
3. Open a new terminal.
4. Run:

```powershell
cd frontend\task-management-ui
Copy-Item .env.example .env
npm install
npm run dev
```

The application is then ready to use.
