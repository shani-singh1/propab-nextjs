import { createTransport } from "nodemailer"
import { render } from "@react-email/render"
import { NotificationEmail } from "@/emails/notification-email"

const transporter = createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

export const EmailService = {
  async sendNotificationEmail(user, notifications) {
    if (!user.email) return

    const emailHtml = render(
      NotificationEmail({
        username: user.name,
        notifications
      })
    )

    await transporter.sendMail({
      from: `"Digital Twin" <${process.env.SMTP_FROM}>`,
      to: user.email,
      subject: "New Notifications from Digital Twin",
      html: emailHtml,
    })
  }
} 