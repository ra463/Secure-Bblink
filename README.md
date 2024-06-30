# Secure Blink Backend Developer

**Clone This Repo**

```
git clone https://github.com/ra463/Secure-Bblink.git
```

**For Admin Route you have himself edit the role="admin" in mongoDB database**

Create a file named `config.env` in the `config` folder and add the following env variable

```
JWT_SECRET="Your Random JWT Secret"

JWT_EXPIRE="Random days to expire JWT Token"

PORT=4000(Or any port of your choice)

MONGO_URI="Your MongoDB Atlas/local Url to connect to database"

EMAIL="Your email for sending codes via Nodemailer"

PASSWORD="Password of that Email"

TIME="Time for express-rate-limiting so that user can send limited request for that time"

MAX="No. of request user can send at the particular interval of time"

```



Install all the dependencies by running the command `npm install`

To run this project simply run the command `npm run dev`
