# KREST HR API — Endpoints per Screen

This document maps each screens to the backend endpoints required to power it, along with expected request/response shapes.

---

## 1. Login Screen (`Connexion`)

**Fields shown:** Identifiant, Mot de passe

### `POST /auth/login`

**Request**
```json
{
  "identifiant": "johndoe",
  "password": "********"
}
```

**Response 200**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "uuid": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "johndoe@gmail.com",
    "role": "ADMIN",
    "avatarUrl": "https://minio.../avatars/1.png"
  }
}
```

**Response 401**
```json
{
  "statusCode": 401,
  "message": "Invalid credentials"
}
```

---

## 2. Dashboard (`Tableau de bord`)

**Widgets shown:** Demande de congés (count), Total employés (count + delta), Dernier bulletin disponible, Historique des congés (table)

### `GET /dashboard/summary`

**Response 200**
```json
{
  "pendingLeaveRequests": 5,
  "totalEmployees": 15,
  "employeesAddedThisYear": 2,
  "lastPayslip": {
    "period": "2025-06",
    "label": "Juin 2025",
    "totalBulletins": 13
  }
}
```

### `GET /leaves/recent?limit=5`

Powers the "Historique des congés" table on the dashboard.

**Response 200**
```json
{
  "data": [
    {
      "uuid": 12,
      "employee": { "uuid": 4, "firstName": "Paul", "lastName": "Atangana" },
      "startDate": "2024-12-12",
      "endDate": "2025-01-12",
      "status": "PENDING",
      "type": "ANNUAL"
    },
    {
      "uuid": 13,
      "employee": { "uuid": 5, "firstName": "Engelbert", "lastName": "Kamga" },
      "startDate": "2024-12-12",
      "endDate": "2025-01-12",
      "status": "ON_LEAVE",
      "type": "MATERNITY"
    }
  ]
}
```

`status` enum maps to UI labels:
| API value | UI label |
|---|---|
| `PENDING` | En attente |
| `ON_LEAVE` | En congés |
| `REJECTED` | Rejeté |
| `COMPLETED` | Terminé |
| `APPROVED` | Approuvé |

`type` enum maps to UI labels:
| API value | UI label |
|---|---|
| `ANNUAL` | Annuel |
| `MATERNITY` | Maternité |
| `SICK` | Maladie |
| `DEATH` | Décès |

---

## 3. Employee List (`Gestion des employés`)

**Filters shown:** Département, Rechercher par nom, Ancienneté inférieure à, Valeur
**Table columns:** Employé, Poste, Département, Ancienneté, Date d'entrée, Fin Contrat (with status dot), Actions

### `GET /employees`

**Query params**
```
?departmentId=2
&search=Atangana
&seniorityLt=5          // years
&page=1
&limit=10
```

**Response 200**
```json
{
  "data": [
    {
      "uuid": 4,
      "fullName": "Atangana Paul",
      "position": { "uuid": 9, "title": "Developpeur" },
      "department": { "uuid": 2, "name": "Informatique" },
      "seniorityYears": 5,
      "hireDate": "2020-01-12",
      "contract": {
        "uuid": 21,
        "endDate": "2025-01-12",
        "status": "ACTIVE"
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalPages": 15,
    "totalItems": 150
  }
}
```

Status dot color mapping for `contract.status`:
| API value | Dot color |
|---|---|
| `ACTIVE` | green |
| `EXPIRING_SOON` | orange |
| `EXPIRED` | red |

### Row actions menu (from the `⋮` dropdown)

| Action | Endpoint |
|---|---|
| Voir | `GET /employees/:id` |
| Modifier | `PATCH /employees/:id` |
| Ajouter DIPE | `POST /employees/:id/dipe` |
| Suspendre | `PATCH /employees/:id/suspend` |
| Supprimer | `DELETE /employees/:id` (soft delete → `isActive: false`) |

---

## 4. Add Employee — Step 1 (`Ajouter un employé` / Informations Personnelles)

**Fields shown:** Nom, Prénom, Adresse complète, Téléphone, Date de Naissance, Adresse email, Sexe, Situation matrimoniale, Nationalité, Nombre d'enfant(s), Pays de résidence, Personne à contacter

This is a 3-step wizard (Informations Personnelles → Informations Administratives → Informations Professionnelles). The frontend should hold state across steps and submit once at the end, OR create a draft progressively. Recommended: **submit once at the final step**.

### `POST /employees`

**Request**
```json
{
  "lastName": "Atangana",
  "firstName": "Paul",
  "address": "Ville, quartier",
  "phoneNumber": "+237677777777",
  "birthday": "1995-03-10",
  "email": "paul.atangana@example.com",
  "gender": "MALE",
  "matrimonialStatus": "SINGLE",
  "nationality": "CAMEROUNAISE",
  "numberOfChildren": 0,
  "countryOfResidence": "CAMEROUN",
  "emergencyContactPhone": "677777777",

  "administrativeInfo": {
    "cnpsNumber": "123456789",
    "idDocumentNumber": "CM00112233",
    "idDocumentExpiry": "2030-01-01"
  },

  "professionalInfo": {
    "departmentId": 2,
    "positionId": 9,
    "hireDate": "2026-06-17",
    "contractType": "FULL_TIME",
    "baseSalary": 250000
  }
}
```

**Response 201**
```json
{
  "uuid": 16,
  "fullName": "Atangana Paul",
  "status": "ACTIVE",
  "createdAt": "2026-06-17T10:00:00Z"
}
```

**Response 422 (validation)**
```json
{
  "statusCode": 422,
  "errors": {
    "email": ["Adresse email invalide"],
    "phoneNumber": ["Téléphone requis"]
  }
}
```

### Supporting dropdowns on this step

| Field | Endpoint |
|---|---|
| Sexe | static enum `["MALE","FEMALE"]` |
| Situation matrimoniale | static enum `["SINGLE","MARRIED","DIVORCED","WIDOWED"]` |


---

## 5. Employee Actions Dropdown (already covered above, image 5)

Same as section 3 — included here for cross-reference since image 5 is the same screen with the menu open.

---

## 6. Leave Management (`Gestion des congés`)

**Filters:** Employé, Statut de la demande
**Buttons:** Historique, Demander une absence
**Table columns:** Employés, Congés total, Congés consommés, Congés restant, Demande (Oui/Non)
**Row menu:** Voir, Traiter la demande, Rejeter la demande

### `GET /leaves`

**Query params**
```
?employeeId=4
&status=PENDING
&page=1
&limit=10
```

**Response 200**
```json
{
  "data": [
    {
      "employee": { "uuid": 4, "fullName": "Atangana Paul" },
      "totalLeaveDays": 15,
      "usedLeaveDays": 15,
      "remainingLeaveDays": 15,
      "hasPendingRequest": true
    }
  ],
  "meta": { "page": 1, "limit": 10, "totalPages": 15 }
}
```

### `GET /leaves/history?employeeId=4`

Powers the "Historique" button.

**Response 200**
```json
{
  "data": [
    {
      "uuid": 12,
      "type": "ANNUAL",
      "startDate": "2024-12-12",
      "endDate": "2025-01-12",
      "status": "APPROVED",
      "approvedBy": "John Doe",
      "createdAt": "2024-12-01T08:00:00Z"
    }
  ]
}
```

### `POST /leaves` (Demander une absence)

**Request**
```json
{
  "employeeId": 4,
  "type": "ANNUAL",
  "startDate": "2026-07-01",
  "endDate": "2026-07-15",
  "reason": "Vacances familiales"
}
```

**Response 201**
```json
{
  "uuid": 30,
  "status": "PENDING",
  "createdAt": "2026-06-17T10:00:00Z"
}
```

### `PATCH /leaves/:id/approve` (Traiter la demande)

**Response 200**
```json
{
  "uuid": 12,
  "status": "APPROVED",
  "approvedBy": 1,
  "approvedAt": "2026-06-17T10:05:00Z"
}
```

### `PATCH /leaves/:id/reject` (Rejeter la demande)

**Request**
```json
{
  "rejectReason": "Effectif insuffisant sur cette période"
}
```

**Response 200**
```json
{
  "uuid": 13,
  "status": "REJECTED",
  "rejectReason": "Effectif insuffisant sur cette période"
}
```

### `GET /leaves/:id` (Voir)

**Response 200**
```json
{
  "uuid": 12,
  "employee": { "uuid": 4, "fullName": "Atangana Paul" },
  "type": "ANNUAL",
  "startDate": "2024-12-12",
  "endDate": "2025-01-12",
  "reason": "Vacances familiales",
  "status": "PENDING",
  "createdAt": "2024-12-01T08:00:00Z"
}
```

---
## 6. Employee Attendance Management

Handling employee attendance (check-in/check-out) and absentees 

### `/attendance` List all attendance records

**Response 200**
```json
 [
  {
    "uuid": 1,
    "fullName": "John Doe",
    "status": "ACTIVE",
    "department": { "uuid": 1, "name": "HR" },
    "position": { "uuid": 1, "title": "Manager" },
    "attendance": {
      "checkIn": "2023-10-01T09:00:00Z",
      "checkOut": "2023-10-01T17:00:00Z",
      "workedHour": 8,
      "overtimes": 1,
      "status": "PRESENT"
    }
  }
]
```

---

## 7. Employee Payroll Management

Handling employee payroll (generate, view, edit, approve, mark as paid, delete)

---

## Summary Table — All Endpoints

| Screen | Method | Endpoint |
|---|---|---|
| Login | POST | `/auth/login` |
| Dashboard | GET | `/dashboard/summary` |
| Dashboard | GET | `/leaves/recent` |
| Employee list | GET | `/employees` |
| Employee list | GET | `/employees/:id` |
| Employee list | PATCH | `/employees/:id` |
| Employee list | PATCH | `/employees/:id/suspend` |
| Employee list | DELETE | `/employees/:id` |
| Add employee | POST | `/employees` |
| Add employee | POST | `/employees/:id/dipe` |
| Leave management | GET | `/leaves` |
| Leave management | GET | `/leaves/:id` |
| Leave management | GET | `/leaves/history` |
| Leave management | POST | `/leaves` |
| Leave management | PATCH | `/leaves/:id/approve` |
| Leave management | PATCH | `/leaves/:id/reject` |

---
