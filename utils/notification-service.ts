import { createClient } from "@/utils/supabase/server";

export interface NotificationData {
  userId: string;
  userEmail: string;
  type: 'subscription_ending' | 'new_camp' | 'subscription_expired';
  data: any;
}

export class NotificationService {
  private static async getUserNotificationSettings(userId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('user_notification_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching notification settings:', error);
      return null;
    }

    return data;
  }

  private static async sendEmail(to: string, subject: string, content: string) {
    try {
      // For now, we'll use console.log to simulate email sending
      // In production, you would integrate with a service like Resend, SendGrid, etc.
      console.log('=== EMAIL NOTIFICATION ===');
      console.log('To:', to);
      console.log('Subject:', subject);
      console.log('Content:', content);
      console.log('==========================');
      
      // TODO: Implement actual email sending
      // Example with Resend:
      // const resend = new Resend(process.env.RESEND_API_KEY);
      // await resend.emails.send({
      //   from: 'noreply@yourdomain.com',
      //   to: [to],
      //   subject: subject,
      //   html: content,
      // });
      
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  static async sendSubscriptionEndingNotification(userId: string, subscriptionData: any) {
    const settings = await this.getUserNotificationSettings(userId);
    
    if (!settings || !settings.subscription_reminders) {
      return false;
    }

    const supabase = await createClient();
    const { data: userData } = await supabase.auth.admin.getUserById(userId);
    
    if (!userData?.user?.email) {
      return false;
    }

    const subject = 'Twoja subskrypcja kończy się wkrótce';
    const content = `
      <h2>Przypomnienie o kończącej się subskrypcji</h2>
      <p>Witaj!</p>
      <p>Twoja subskrypcja na zajęcia <strong>${subscriptionData.activity_name}</strong> kończy się <strong>${new Date(subscriptionData.end_date).toLocaleDateString('pl-PL')}</strong>.</p>
      <p>Nie przegap swoich ulubionych zajęć - odnow subskrypcję już dziś!</p>
      <p>Pozdrawiamy,<br>Zespół RISU</p>
    `;

    return await this.sendEmail(userData.user.email, subject, content);
  }

  static async sendNewCampNotification(userId: string, campData: any) {
    const settings = await this.getUserNotificationSettings(userId);
    
    if (!settings || !settings.camp_notifications) {
      return false;
    }

    const supabase = await createClient();
    const { data: userData } = await supabase.auth.admin.getUserById(userId);
    
    if (!userData?.user?.email) {
      return false;
    }

    const subject = 'Nowy obóz dostępny! 🏕️';
    const content = `
      <h2>Nowy obóz: ${campData.name}</h2>
      <p>Witaj!</p>
      <p>Mamy dla Ciebie ekscytujące wieści - nowy obóz <strong>${campData.name}</strong> jest już dostępny!</p>
      <p><strong>Termin:</strong> ${new Date(campData.start_date).toLocaleDateString('pl-PL')} - ${new Date(campData.end_date).toLocaleDateString('pl-PL')}</p>
      <p><strong>Lokalizacja:</strong> ${campData.location}</p>
      <p><strong>Cena:</strong> ${campData.price} zł</p>
      <p>${campData.description}</p>
      <p>Zarezerwuj swoje miejsce już dziś!</p>
      <p>Pozdrawiamy,<br>Zespół RISU</p>
    `;

    return await this.sendEmail(userData.user.email, subject, content);
  }

  static async sendSubscriptionExpiredNotification(userId: string, subscriptionData: any) {
    const settings = await this.getUserNotificationSettings(userId);
    
    if (!settings || !settings.subscription_reminders) {
      return false;
    }

    const supabase = await createClient();
    const { data: userData } = await supabase.auth.admin.getUserById(userId);
    
    if (!userData?.user?.email) {
      return false;
    }

    const subject = 'Twoja subskrypcja wygasła';
    const content = `
      <h2>Subskrypcja wygasła</h2>
      <p>Witaj!</p>
      <p>Twoja subskrypcja na zajęcia <strong>${subscriptionData.activity_name}</strong> wygasła <strong>${new Date(subscriptionData.end_date).toLocaleDateString('pl-PL')}</strong>.</p>
      <p>Nie przegap swoich ulubionych zajęć - odnow subskrypcję już dziś!</p>
      <p>Pozdrawiamy,<br>Zespół RISU</p>
    `;

    return await this.sendEmail(userData.user.email, subject, content);
  }

  // Batch notification methods for admin use
  static async notifyUsersAboutEndingSubscriptions() {
    const supabase = await createClient();
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Get subscriptions ending in the next 30 days
    const { data: endingSubscriptions, error } = await supabase
      .from('class_subscriptions')
      .select(`
        *,
        users!user_id(email),
        activities!activity_id(name)
      `)
      .eq('status', 'active')
      .lte('end_date', thirtyDaysFromNow.toISOString())
      .gte('end_date', now.toISOString());

    if (error) {
      console.error('Error fetching ending subscriptions:', error);
      return;
    }

    for (const subscription of endingSubscriptions || []) {
      await this.sendSubscriptionEndingNotification(
        subscription.user_id,
        {
          activity_name: subscription.activities?.name || 'Nieznane zajęcia',
          end_date: subscription.end_date
        }
      );
    }
  }

  static async notifyUsersAboutNewCamps() {
    const supabase = await createClient();
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get camps created in the last 7 days
    const { data: newCamps, error } = await supabase
      .from('camps')
      .select('*')
      .gte('created_at', sevenDaysAgo.toISOString());

    if (error) {
      console.error('Error fetching new camps:', error);
      return;
    }

    // Get all users with camp notifications enabled
    const { data: usersWithNotifications, error: usersError } = await supabase
      .from('user_notification_settings')
      .select('user_id')
      .eq('camp_notifications', true);

    if (usersError) {
      console.error('Error fetching users with notifications:', error);
      return;
    }

    for (const camp of newCamps || []) {
      for (const userSetting of usersWithNotifications || []) {
        await this.sendNewCampNotification(userSetting.user_id, camp);
      }
    }
  }
}
