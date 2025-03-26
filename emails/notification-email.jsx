import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components"

export function NotificationEmail({ username, notifications }) {
  return (
    <Html>
      <Head />
      <Preview>You have new notifications from Digital Twin</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Hi {username},</Heading>
          <Text style={text}>
            You have {notifications.length} new notification{notifications.length > 1 ? "s" : ""}.
          </Text>

          <Section style={section}>
            {notifications.map((notification) => (
              <div key={notification.id} style={notificationStyle}>
                <Text style={notificationTitle}>
                  {notification.title}
                </Text>
                <Text style={notificationMessage}>
                  {notification.message}
                </Text>
              </div>
            ))}
          </Section>

          <Link href={process.env.NEXT_PUBLIC_APP_URL} style={button}>
            View in Digital Twin
          </Link>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: "#f6f9fc",
  padding: "10px 0",
}

const container = {
  backgroundColor: "#ffffff",
  border: "1px solid #f0f0f0",
  borderRadius: "5px",
  margin: "0 auto",
  padding: "45px",
  width: "465px",
}

const h1 = {
  color: "#000",
  fontSize: "24px",
  fontWeight: "normal",
  margin: "30px 0",
  padding: "0",
}

const text = {
  color: "#000",
  fontSize: "14px",
  lineHeight: "24px",
}

const section = {
  padding: "20px 0",
}

const notificationStyle = {
  borderBottom: "1px solid #f0f0f0",
  marginBottom: "20px",
  paddingBottom: "20px",
}

const notificationTitle = {
  ...text,
  fontWeight: "bold",
  margin: "0 0 10px",
}

const notificationMessage = {
  ...text,
  margin: "0",
}

const button = {
  backgroundColor: "#000",
  borderRadius: "5px",
  color: "#fff",
  display: "inline-block",
  fontSize: "14px",
  fontWeight: "bold",
  padding: "10px 20px",
  textDecoration: "none",
  textAlign: "center",
  width: "100%",
} 