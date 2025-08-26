const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: true, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
    }

    // Verify email configuration
    async verifyConnection() {
        try {
            await this.transporter.verify();
            console.log('Email service is ready to send emails');
            return true;
        } catch (error) {
            console.error('Email service configuration error:', error);
            return false;
        }
    }

    // Send generic email
    async sendEmail(to, subject, html, text = '') {
        try {
            const mailOptions = {
                from: process.env.EMAIL_FROM,
                to,
                subject,
                html,
                text: text || this.stripHtml(html)
            };

            const result = await this.transporter.sendMail(mailOptions);
            console.log('Email sent successfully:', result.messageId);
            return { success: true, messageId: result.messageId };
        } catch (error) {
            console.error('Email sending error:', error);
            return { success: false, error: error.message };
        }
    }

    // Send quiz results email
    async sendQuizResults(user, submission, quiz) {
        try {
            const subject = `Quiz Results: ${quiz.title}`;
            const html = this.generateQuizResultsEmail(user, submission, quiz);

            return await this.sendEmail(user.email, subject, html);
        } catch (error) {
            console.error('Quiz results email error:', error);
            return { success: false, error: error.message };
        }
    }

    // Generate quiz results email HTML
    generateQuizResultsEmail(user, submission, quiz) {
        const performanceColor = submission.percentage >= 70 ? '#10b981' : submission.percentage >= 50 ? '#f59e0b' : '#ef4444';
        const performanceText = submission.performance;

        return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Quiz Results</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    margin: 0;
                    padding: 0;
                    background-color: #f4f4f4;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    padding: 0;
                    border-radius: 10px;
                    overflow: hidden;
                    box-shadow: 0 0 10px rgba(0,0,0,0.1);
                }
                .header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 30px;
                    text-align: center;
                }
                .header h1 {
                    margin: 0;
                    font-size: 28px;
                }
                .content {
                    padding: 30px;
                }
                .score-card {
                    background: linear-gradient(135deg, ${performanceColor} 0%, ${performanceColor}cc 100%);
                    color: white;
                    padding: 25px;
                    border-radius: 10px;
                    text-align: center;
                    margin: 20px 0;
                }
                .score-card h2 {
                    margin: 0 0 10px 0;
                    font-size: 36px;
                }
                .score-card p {
                    margin: 5px 0;
                    font-size: 18px;
                }
                .stats {
                    display: flex;
                    justify-content: space-between;
                    margin: 20px 0;
                    background-color: #f8f9fa;
                    padding: 20px;
                    border-radius: 8px;
                }
                .stat-item {
                    text-align: center;
                    flex: 1;
                }
                .stat-item h3 {
                    margin: 0 0 5px 0;
                    color: #333;
                    font-size: 24px;
                }
                .stat-item p {
                    margin: 0;
                    color: #666;
                    font-size: 14px;
                }
                .details {
                    margin: 20px 0;
                    background-color: #f8f9fa;
                    padding: 20px;
                    border-radius: 8px;
                }
                .details h3 {
                    margin-top: 0;
                    color: #333;
                }
                .details p {
                    margin: 5px 0;
                    color: #666;
                }
                .insights {
                    background-color: #e3f2fd;
                    border-left: 4px solid #2196f3;
                    padding: 15px;
                    margin: 20px 0;
                    border-radius: 0 8px 8px 0;
                }
                .insights h3 {
                    margin-top: 0;
                    color: #1976d2;
                }
                .insights ul {
                    margin: 10px 0;
                    padding-left: 20px;
                }
                .insights li {
                    color: #424242;
                    margin: 5px 0;
                }
                .footer {
                    background-color: #f1f1f1;
                    padding: 20px;
                    text-align: center;
                    color: #666;
                    font-size: 14px;
                }
                .button {
                    display: inline-block;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 12px 30px;
                    text-decoration: none;
                    border-radius: 25px;
                    margin: 20px 0;
                    font-weight: bold;
                }
                @media (max-width: 600px) {
                    .stats {
                        flex-direction: column;
                        gap: 15px;
                    }
                    .container {
                        margin: 10px;
                    }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎓 Quiz Results</h1>
                    <p>Your performance summary is ready!</p>
                </div>
                
                <div class="content">
                    <p>Hi <strong>${user.firstName || user.username}</strong>,</p>
                    <p>You have successfully completed the quiz: <strong>"${quiz.title}"</strong></p>
                    
                    <div class="score-card">
                        <h2>${submission.percentage}%</h2>
                        <p><strong>${performanceText} Performance!</strong></p>
                        <p>Grade: ${submission.grade}</p>
                    </div>

                    <div class="stats">
                        <div class="stat-item">
                            <h3>${submission.score}</h3>
                            <p>Points Earned</p>
                        </div>
                        <div class="stat-item">
                            <h3>${submission.correctAnswers}</h3>
                            <p>Correct Answers</p>
                        </div>
                        <div class="stat-item">
                            <h3>${Math.floor(submission.timeTaken / 60)}m ${submission.timeTaken % 60}s</h3>
                            <p>Time Taken</p>
                        </div>
                    </div>

                    <div class="details">
                        <h3>📊 Detailed Results</h3>
                        <p><strong>Quiz:</strong> ${quiz.title}</p>
                        <p><strong>Category:</strong> ${quiz.category}</p>
                        <p><strong>Difficulty:</strong> ${quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1)}</p>
                        <p><strong>Total Questions:</strong> ${quiz.totalQuestions}</p>
                        <p><strong>Total Marks:</strong> ${submission.totalMarks}</p>
                        <p><strong>Your Score:</strong> ${submission.score}/${submission.totalMarks} (${submission.percentage}%)</p>
                        <p><strong>Correct Answers:</strong> ${submission.correctAnswers}</p>
                        <p><strong>Incorrect Answers:</strong> ${submission.incorrectAnswers}</p>
                        ${submission.skippedAnswers > 0 ? `<p><strong>Skipped Questions:</strong> ${submission.skippedAnswers}</p>` : ''}
                        <p><strong>Time Taken:</strong> ${Math.floor(submission.timeTaken / 60)} minutes ${submission.timeTaken % 60} seconds</p>
                        <p><strong>Completed At:</strong> ${new Date(submission.endTime).toLocaleString()}</p>
                    </div>

                    <div class="insights">
                        <h3>💡 Performance Insights</h3>
                        <ul>
                            ${submission.getPerformanceInsights().map(insight => `<li>${insight}</li>`).join('')}
                        </ul>
                    </div>

                    <div style="text-align: center;">
                        <a href="${process.env.CLIENT_URL}/quiz/${quiz._id}" class="button">
                            ${quiz.settings.allowRetake ? 'Retake Quiz' : 'View Quiz'}
                        </a>
                        <a href="${process.env.CLIENT_URL}/dashboard" class="button">
                            View Dashboard
                        </a>
                    </div>

                    <p>Keep up the great work and continue learning! 📚</p>
                    <p>Best regards,<br>The Quiz App Team</p>
                </div>

                <div class="footer">
                    <p>This email was sent automatically. Please do not reply to this email.</p>
                    <p>© ${new Date().getFullYear()} Quiz App. All rights reserved.</p>
                    <p><a href="${process.env.CLIENT_URL}/unsubscribe" style="color: #666;">Unsubscribe</a> | 
                       <a href="${process.env.CLIENT_URL}/privacy" style="color: #666;">Privacy Policy</a></p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    // Send welcome email
    async sendWelcomeEmail(user) {
        try {
            const subject = 'Welcome to Quiz App!';
            const html = this.generateWelcomeEmail(user);

            return await this.sendEmail(user.email, subject, html);
        } catch (error) {
            console.error('Welcome email error:', error);
            return { success: false, error: error.message };
        }
    }

    // Generate welcome email HTML
    generateWelcomeEmail(user) {
        return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to Quiz App</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f4f4f4; }
                .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 0; border-radius: 10px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center; }
                .header h1 { margin: 0; font-size: 32px; }
                .content { padding: 40px; }
                .welcome-message { background-color: #f8f9fa; padding: 25px; border-radius: 10px; margin: 20px 0; text-align: center; }
                .features { display: flex; justify-content: space-between; margin: 30px 0; }
                .feature { text-align: center; flex: 1; padding: 0 15px; }
                .feature-icon { font-size: 48px; margin-bottom: 10px; }
                .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 25px; margin: 20px 0; font-weight: bold; }
                .footer { background-color: #f1f1f1; padding: 20px; text-align: center; color: #666; font-size: 14px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎓 Welcome to Quiz App!</h1>
                    <p>Your journey to knowledge starts here</p>
                </div>
                
                <div class="content">
                    <div class="welcome-message">
                        <h2>Hello ${user.firstName || user.username}! 👋</h2>
                        <p>Thank you for joining Quiz App. We're excited to help you test and expand your knowledge!</p>
                    </div>

                    <div class="features">
                        <div class="feature">
                            <div class="feature-icon">📚</div>
                            <h3>Diverse Topics</h3>
                            <p>Test your knowledge across multiple categories</p>
                        </div>
                        <div class="feature">
                            <div class="feature-icon">⏱️</div>
                            <h3>Timed Challenges</h3>
                            <p>Challenge yourself with time-based quizzes</p>
                        </div>
                        <div class="feature">
                            <div class="feature-icon">📊</div>
                            <h3>Track Progress</h3>
                            <p>Monitor your improvement with detailed analytics</p>
                        </div>
                    </div>

                    <div style="text-align: center;">
                        <a href="${process.env.CLIENT_URL}/dashboard" class="button">Start Your First Quiz</a>
                    </div>

                    <p><strong>Getting Started:</strong></p>
                    <ol>
                        <li>Browse available quiz categories</li>
                        <li>Select your preferred difficulty level</li>
                        <li>Take the quiz and get instant results</li>
                        <li>Review your performance and improve</li>
                    </ol>

                    <p>If you have any questions, feel free to contact our support team.</p>
                    <p>Happy learning!<br>The Quiz App Team</p>
                </div>

                <div class="footer">
                    <p>© ${new Date().getFullYear()} Quiz App. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    // Send password reset email
    async sendPasswordResetEmail(user, resetToken) {
        try {
            const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
            const subject = 'Password Reset Request';
            const html = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Password Reset</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f4f4f4; }
                    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 10px; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .header h1 { color: #333; }
                    .button { display: inline-block; background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🔒 Password Reset Request</h1>
                    </div>
                    
                    <p>Hi ${user.firstName || user.username},</p>
                    <p>You requested a password reset for your Quiz App account.</p>
                    <p>Click the button below to reset your password:</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" class="button">Reset Password</a>
                    </div>
                    
                    <p>If you didn't request this reset, please ignore this email.</p>
                    <p>This link will expire in 1 hour for security reasons.</p>
                    
                    <p>Best regards,<br>The Quiz App Team</p>
                </div>
            </body>
            </html>
            `;

            return await this.sendEmail(user.email, subject, html);
        } catch (error) {
            console.error('Password reset email error:', error);
            return { success: false, error: error.message };
        }
    }

    // Strip HTML tags for plain text version
    stripHtml(html) {
        return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    }

    // Send bulk emails (for notifications, newsletters, etc.)
    async sendBulkEmails(recipients, subject, html, text = '') {
        const results = [];
        const batchSize = 10; // Send in batches to avoid overwhelming the server

        for (let i = 0; i < recipients.length; i += batchSize) {
            const batch = recipients.slice(i, i + batchSize);
            const batchPromises = batch.map(recipient => 
                this.sendEmail(recipient.email, subject, html, text)
            );

            try {
                const batchResults = await Promise.allSettled(batchPromises);
                results.push(...batchResults);
            } catch (error) {
                console.error(`Batch email error for batch ${i/batchSize + 1}:`, error);
            }

            // Add delay between batches to avoid rate limiting
            if (i + batchSize < recipients.length) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        return results;
    }
}

module.exports = new EmailService();