🟢 BTC365 Projects Application Back End 🟢

This is a Node.js using Express library back-end for the web application BTC365 Projects.

The purpose of this application is to allow the translation agency BTC365 to manage translations in an easy way. The admin can create projects and assign them to the different translators that are registered. This way, admin and translator can both see the main information regarding the management of a project: due date, languages (from and to) and number of words. The admin can also upload the document to be translated by the translator, and the translator can upload the document when translated.

In this back-end, the four basic operations a software application can perform, CRUD, are defined.

🔸The document database that is used is MongoDB (https://www.mongodb.com/), with Mongoose (https://mongoosejs.com/) to model it. The API for the app is built using Render (https://render.com/docs).
For storage and uploding images and text files, Supabase (https://supabase.com/) and Multer (https://www.npmjs.com/package/multer) are used.

🔸The language in which this app is programmed is Typescript (https://www.typescriptlang.org/).

🔸In order to keep the code clean and follow best practices, these tools are used:

-Husky hooks (https://typicode.github.io/husky/#/)

-Eslint (https://eslint.org/)

-Code formatter Prettier (https://prettier.io/)

-SonarCloud (https://www.sonarsource.com/products/sonarcloud/)

-Editorconfig

🔸Testing is also done through all the project, with the help of:

-Jest (https://jestjs.io/)

-Mock Service Worker (https://mswjs.io/)

-MongoDB Memory Server (https://www.npmjs.com/package/mongodb-memory-server)

-Supertest (https://www.npmjs.com/package/supertest)

🔸API Endpoints
-Get translations:
https://lorena-anaya-final-project-back-202301.onrender.com/translations/

-Get user translations:
https://lorena-anaya-final-project-back-202301.onrender.com/user/:id/translations

-Get translation by id:
https://lorena-anaya-final-project-back-202301.onrender.com/translations/:id

-Delete translation by id:
https://lorena-anaya-final-project-back-202301.onrender.com/translations/:id

-Create a translation:
https://lorena-anaya-final-project-back-202301.onrender.com/translations/

-Update translation status:
https://lorena-anaya-final-project-back-202301.onrender.com/translations/status/:id

-Get users:
https://lorena-anaya-final-project-back-202301.onrender.com/user/all

-Get user name:
https://lorena-anaya-final-project-back-202301.onrender.com/user/:id/name

-Register user:
https://lorena-anaya-final-project-back-202301.onrender.com/auth/register

-Login user:
https://lorena-anaya-final-project-back-202301.onrender.com/auth/login
