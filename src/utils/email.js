const nodemailer = require("nodemailer")
const { logger } = require("./logger")

/**
 * Configuração do transporte de email
 */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_PORT === "465",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

/**
 * Envia um email
 * @param {Object} options - Opções do email
 * @param {string} options.to - Destinatário
 * @param {string} options.subject - Assunto
 * @param {string} options.text - Corpo do email em texto
 * @param {string} options.html - Corpo do email em HTML
 * @returns {Promise} Resultado do envio
 */
exports.sendEmail = async (options) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    }

    const info = await transporter.sendMail(mailOptions)
    logger.info(`Email enviado: ${info.messageId}`)
    return info
  } catch (error) {
    logger.error("Erro ao enviar email:", error)
    throw error
  }
}

