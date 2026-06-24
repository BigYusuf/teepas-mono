import { Resend } from "resend";
import dotenv from "dotenv";
import ejs from "ejs";
import path from "path";
import { identities } from "../identities";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

// Render EJS template
const renderEmailTemplate = async (
  templateName: string,
  data: Record<string, any>,
): Promise<string> => {
  const templatePath = path.join(
    process.cwd(),
    "src",
    "utils",
    "email-templates",
    `${templateName}.ejs`,
  );

  return ejs.renderFile(templatePath, data);
};

// Send email
export const sendEmail = async (
  to: string,
  subject: string,
  templateName: string,
  data: Record<string, any>,
  identity?: keyof typeof identities,
) => {
  try {
    const html = await renderEmailTemplate(templateName, data);

    const from = identity ? identities[identity] : identities.noreply;

    const response = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });

    return response;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};
