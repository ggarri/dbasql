# Sample Project
This project contains an example of the use of the library `dbaseql`.

## Install project

Step1: Install dependencies
```"
npm install
```

Step2: Update config file in `./config/parameters.json` to add your db crendentials.

Step3: Create following tables within db defined above:
```"
DROP TABLE IF EXISTS "user" CASCADE; 
 CREATE TABLE IF NOT EXISTS "user" (
  "id" SERIAL NOT NULL PRIMARY KEY, 
  "username" VARCHAR(50), 
  "password" VARCHAR(20), 
  "lastname" VARCHAR(100), 
  "firstname" VARCHAR(100), 
  "email" VARCHAR(100), 
  "active" BOOLEAN NOT NULL DEFAULT false, 
  "created_at" TIMESTAMP, 
  "last_login" TIMESTAMP, 
  "deleted" BOOLEAN NOT NULL DEFAULT false ); 
  
  
DROP TABLE IF EXISTS "extra_type" CASCADE; 
CREATE TABLE IF NOT EXISTS "extra_type" (
 "id" SERIAL NOT NULL PRIMARY KEY, 
 "type" TEXT
);

DROP TABLE IF EXISTS "extra" CASCADE; 
CREATE TABLE IF NOT EXISTS "extra" (
  "id" SERIAL NOT NULL PRIMARY KEY, 
  "seller_id" INT,
  "type_id" INT,
  "name" VARCHAR(255), 
  "amount" DECIMAL, 
  "effective_date" DATE, 
  "deleted" BOOLEAN NOT NULL DEFAULT false );
  
INSERT INTO "user" VALUES (1, 'bstebler' ,'123', 'stebler', 'bono', 'bono@base7booking.com', true, NOW(), NULL, false);
INSERT INTO "user" VALUES (2, 'ggarrido' ,'123', 'garrido', 'gabriel', 'gabriel@base7booking.com', true, NOW(), NULL, false);
INSERT INTO "user" VALUES (3, 'azapella' ,'123', 'zappella', 'andrew', 'andrew@base7booking.com', true, NOW(), NULL, false);
select setval('user_id_seq', 4);

INSERT INTO "extra" VALUES (1, 1, 'pizza', 2, NOW());
INSERT INTO "extra" VALUES (2, 1, 'bugger', 2, NOW());
INSERT INTO "extra" VALUES (3, 2, 'cocktail mojito', 10, NOW());
INSERT INTO "extra" VALUES (4, 3, 'shoots', 120, NOW());
select setval('extra_id_seq', 5);

ALTER TABLE "extra" ADD CONSTRAINT seller_id_fkey FOREIGN KEY (seller_id) REFERENCES "user" (id) ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "extra" ADD CONSTRAINT type_id_fkey FOREIGN KEY (type_id) REFERENCES "extra_type" (id) ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;

```

Step4: Start express server on port 3000
```"
npm run start
```

## Examples

### Fetch all users

```"
GET: http://localhost:3000/users
```

### Fetch user by id (Example id = 1)

```"
GET: http://localhost:3000/users/1
```

### Update user by id (Example id = 1)
```
PUT: http://localhost:3000/users/1?attributes={"lastname": "yuste", "firstname": "alejandro", "username": "ayuste"}
```

### Create user
```"
POST: http://localhost:3000/users?attributes={"lastname": "yuste", "firstname": "alejandro", "username": "ayuste", "email": "alejandro@base7booking.com"}
```

### Applying queries
```
GET: http://localhost:3000/users?query={"columns":["id","firstname","createdAt"],"with":{"extras": {"columns":["*"]} }, "where":{"id":{"$type":"gte","$value":3}}}
```

```
GET: http://localhost:3000/users?query={"columns":["id","firstname","createdAt"],"with":{"extras": {"columns":["*"],"with":{"type": {"columns":["*"]} }} }, "where":{"id":{"$type":"gte","$value":3}}}
```

### Delete user by id (Example id = 1)
```"
DELETE: http://localhost:3000/users/1
```
