const nodemailer = require("nodemailer");

const SendEmail = async option => {

    const transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASSWORD
        }
    });

    const mailOption = {
        from: '"DevCamper 👻" <mail@devcamper.com>', // sender address
        to: option.email,
        subject: option.subject,
        text: option.message
    }

    await transporter.sendMail(mailOption)

}

module.exports = SendEmail

