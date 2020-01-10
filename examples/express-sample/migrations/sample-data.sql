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

INSERT INTO "extra_type" VALUES (1, 'Bar');
INSERT INTO "extra_type" VALUES (2, 'Restaurant');
INSERT INTO "extra_type" VALUES (3, 'Room');
select setval('extra_type_id_seq', 4);

INSERT INTO "extra" VALUES (1, 1, 2, 'pizza', 2, NOW());
INSERT INTO "extra" VALUES (2, 1, 2, 'bugger', 2, NOW());
INSERT INTO "extra" VALUES (3, 2, 1, 'cocktail mojito', 10, NOW());
INSERT INTO "extra" VALUES (4, 3, 1, 'shoots', 120, NOW());
select setval('extra_id_seq', 5);

ALTER TABLE "extra" ADD CONSTRAINT seller_id_fkey FOREIGN KEY (seller_id) REFERENCES "user" (id) ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "extra" ADD CONSTRAINT type_id_fkey FOREIGN KEY (type_id) REFERENCES "extra_type" (id) ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
