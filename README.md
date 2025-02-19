# Web Shop - Backend
Ovo je web aplikacija gde možete listati, pretraživati i kupovati proizvode.

 -Neulogovani korisnici mogu pretraživati i pregledati proizvode.

 -Ulogovani korisnici mogu dodati proizvode u korpu, poručiti proizvode, i pratiti status porudžbine u svom profilu (status porudžbine menja administrator). Kada korisnik kupi proizvode iz svoje korpe dobije obaveštenje na e-mail koje je artikle kupio.

 -Administrator može dodavati kategorije, izmeniti kategorije, dodati osobine kao i vršiti izmenu istih, dodati proizvode, vršiti izmenu proizvoda, dodati i brisati slike. Administrator takođe može pratiti porudžbine, prihvatiti, poslati ili odbiti porudžbinu.

# Priprema pokretanja projekta

Da biste uspešno pokrenuli projekat, pratite korake ispod.

# Tehnologije korišćene u projektu
Node.js
JavaScript
TypeScrypt
React
MySQL

# Kreiranje baze podataka
1. U root folderu projekta nalazi se fajl IvaDatabase.sql, koji sadrži strukturu i podatke baze.
2. Otvorite svoj alat za rad sa relacionim bazama (npr. HeidiSQL).
3. Napravite novu praznu bazu podataka.
4. Importujte fajl IvaDatabase.sql u kreiranu bazu.

# Postavljanje storage fajlova
1. U root folderu projekta nalazi se fajl storage.rar koji sadrži slike proizvoda. Najviše slika ima za kategoriju Kozmetika.
2. Ekstraktujte storage.rar na mestu gde se nalaze IvaPharm i Iva-Frontend.
3. Struktura foldera treba da izgleda ovako:
   /root_folder
      |--IvaPharmBackend
      |--IvaPharmFrontend
      |--storage

# Instalacija

1. Klonirajte backend repozitorijum:
git clone https://github.com/AnesKostreba/Iva-Pharm.git
2. Instalirajte zavisnosti:
npm install
3. Pokrenite backend aplikaciju
npm run start:dev
4. Klonirajte frontend repozitorijum:
git clone https://github.com/AnesKostreba/Iva-Front-End.git
5. Instalirajte frontend zavisnosti:
npm install
6. Pokrenite frontend aplikaciju:
npm start

# Administrator
1. Login administrator
  /administrator/login
  username: administrator
  password: administrator
  
  # Nedostatci aplikacije na kojima trenutno radim:
  1. Obrada loše poslatih podataka prilikom registracije i login korisnika.
  2. Dodavanje proizvoda u korpu kada korisnik nije ulogovan.