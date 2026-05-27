import { NextRequest, NextResponse } from "next/server";
import { getZellePaymentsCollection } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { sendEmail } from "@/lib/email";

// GET - Retrieve all Zelle payments
export async function GET() {
  try {
    const collection = await getZellePaymentsCollection();
    const payments = await collection
      .find({})
      .sort({ submittedAt: -1 })
      .toArray();
    
    return NextResponse.json({ payments });
  } catch (error) {
    console.error("Error fetching Zelle payments:", error);
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}

// POST - Create a new Zelle payment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const paymentData = {
      id: body.id || new ObjectId().toString(),
      name: body.name,
      email: body.email,
      phone: body.phone,
      reference: body.reference,
      courseName: body.courseName,
      amount: body.amount,
      screenshotData: body.screenshotData,
      screenshotName: body.screenshotName,
      screenshotType: body.screenshotType,
      status: body.status || "pending",
      submittedAt: body.submittedAt || new Date().toISOString(),
      notes: body.notes || "",
      createdAt: new Date().toISOString(),
    };

    const collection = await getZellePaymentsCollection();
    const result = await collection.insertOne(paymentData);

    const from = process.env.FROM_EMAIL || 'no-reply@example.com';
    const adminRecipients = [
      'info@exceedlearningcenterny.com',
      'olganyc21@gmail.com',
      'phcodesage@gmail.com',
    ];

    try {
      if (!process.env.FROM_EMAIL && !process.env.SMTP_HOST && !process.env.RESEND_API_KEY) {
         console.warn("No Email Configuration found. Skipping Zelle confirmation emails.");
      } else {
        // Send Email to Admin
        await sendEmail({
          from,
          to: adminRecipients,
          subject: "New Zelle Payment Submitted - Chess Kids Class",
          text: `New Zelle Payment for Chess Kids Class:\n\nName: ${paymentData.name}\nEmail: ${paymentData.email || 'N/A'}\nPhone: ${paymentData.phone}\nClass: ${paymentData.courseName}\nAmount: $${paymentData.amount}\nReference: ${paymentData.reference}\n\nPlease verify in the Database/Admin console.`,
          html: `
            <h3>New Zelle Payment Submitted (Chess Kids Class)</h3>
            <ul>
              <li><strong>Name:</strong> ${paymentData.name}</li>
              <li><strong>Email:</strong> ${paymentData.email || 'N/A'}</li>
              <li><strong>Phone:</strong> ${paymentData.phone}</li>
              <li><strong>Class:</strong> ${paymentData.courseName}</li>
              <li><strong>Amount:</strong> $${paymentData.amount}</li>
              <li><strong>Zelle Reference:</strong> ${paymentData.reference}</li>
            </ul>
            <p>Please review and verify this payment in the database/admin console.</p>
          `,
        });

        // Send Email to User (if email exists)
        if (paymentData.email) {
          await sendEmail({
            from,
            to: [paymentData.email],
            subject: "💸 Zelle Payment Received - Chess Kids Class",
            text: `Dear ${paymentData.name},\n\nThank you for submitting a Zelle payment of $${paymentData.amount} for ${paymentData.courseName}!\n\nWe have received your details (Zelle Reference: ${paymentData.reference}). Our team is currently reviewing your payment, and we will contact you shortly to confirm your enrollment.\n\nBest regards,\nChess Kids Class Team`,
            html: `
              <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                <div style="background: linear-gradient(135deg, #ca3433 0%, #a72828 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
                  <h1 style="margin: 0; font-size: 28px;">💵 Payment Received!</h1>
                </div>
                
                <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                  <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Dear <strong>${paymentData.name}</strong>,</p>
                  
                  <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Thank you for submitting your Zelle payment for <strong>${paymentData.courseName}</strong>!</p>
                  
                  <div style="background: #fdf2f2; border-left: 4px solid #ca3433; padding: 15px; margin: 20px 0; border-radius: 4px;">
                    <h3 style="margin-top: 0; color: #a72828;">📋 Payment Details</h3>
                    <p style="margin: 5px 0; color: #333;"><strong>Amount:</strong> $${paymentData.amount}</p>
                    <p style="margin: 0; color: #333;"><strong>Zelle Reference:</strong> ${paymentData.reference}</p>
                  </div>
                  
                  <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
                    <h3 style="margin-top: 0; color: #856404;">⏭️ Next Steps</h3>
                    <p style="margin: 0; color: #856404;">Our team is reviewing your payment to verify the transfer. We will contact you shortly to confirm your enrollment and provide further instructions.</p>
                  </div>
                  
                  <p style="font-size: 16px; color: #333; margin-top: 20px;">If you have any questions in the meantime, please don't hesitate to reach out to us.</p>
                  
                  <p style="font-size: 16px; color: #333; margin-top: 30px;">
                    Best regards,<br>
                    <strong>Chess Kids Class Team</strong>
                  </p>
                </div>
                
                <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
                  <p>This is an automated confirmation email. Please do not reply directly to this email.</p>
                </div>
              </div>
            `,
          });
        }
      }
    } catch (emailErr) {
      console.error("Failed to send Zelle payment email:", emailErr);
    }

    return NextResponse.json({ 
      success: true, 
      payment: { ...paymentData, _id: result.insertedId } 
    });
  } catch (error) {
    console.error("Error creating Zelle payment:", error);
    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 }
    );
  }
}
