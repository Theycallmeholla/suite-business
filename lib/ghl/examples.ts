// Example: Fully Automated Sub-Account Creation and Setup
import { createGHLProClient } from '@/lib/ghl';
import { logger } from '@/lib/logger';

export async function fullyAutomatedGHLSetup(businessData: {
  name: string;
  email: string;
  phone: string;
  address: string;
  industry: string;
}) {
  const ghlClient = createGHLProClient(); // Uses Private Integration key
  
  try {
    // Step 1: Create sub-account (AUTOMATED)
    logger.info('Creating GHL sub-account...');
    const location = await ghlClient.createSaasSubAccount({
      businessName: businessData.name,
      email: businessData.email,
      phone: businessData.phone,
      address: businessData.address,
      industry: businessData.industry,
    });
    
    // Step 2: Create custom fields (AUTOMATED)
    logger.info('Setting up custom fields...');
    const customFields = [
      { name: 'lead_source', dataType: 'TEXT' as const },
      { name: 'project_type', dataType: 'DROPDOWN' as const, options: ['Residential', 'Commercial'] },
    ];
    
    for (const field of customFields) {
      await ghlClient.createCustomField(location.id, field);
    }
    
    // Step 3: Create initial contact (AUTOMATED)
    logger.info('Creating welcome contact...');
    const contact = await ghlClient.createContact(location.id, {
      firstName: businessData.name.split(' ')[0],
      lastName: 'Admin',
      email: businessData.email,
      tags: ['owner', 'vip'],
      source: 'System Setup',
    });
    
    // Step 4: Set up calendar (AUTOMATED)
    logger.info('Fetching calendars...');
    const calendars = await ghlClient.getCalendars(location.id);
    
    // Step 5: Create a task (AUTOMATED)
    logger.info('Creating onboarding task...');
    await ghlClient.createTask({
      title: 'Complete Onboarding',
      body: 'Welcome! Please complete your business profile setup.',
      contactId: contact.id,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });
    
    // Step 6: Send welcome email (AUTOMATED)
    logger.info('Sending welcome email...');
    await ghlClient.sendEmail(
      contact.id,
      'Welcome to Our Platform!',
      `Hi ${businessData.name},\n\nYour account has been set up successfully!`,
      `<h1>Welcome!</h1><p>Your account is ready to go.</p>`
    );
    
    return {
      success: true,
      locationId: location.id,
      contactId: contact.id,
      message: 'Fully automated setup complete!'
    };
    
  } catch (error) {
    logger.error('Automated setup failed', error);
    throw error;
  }
}

// Example: Automated Daily Operations
export async function automatedDailyOperations(locationId: string) {
  const ghlClient = createGHLProClient();
  
  // Get today's appointments (AUTOMATED)
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const appointments = await ghlClient.getAppointments({
    startDate: today.toISOString(),
    endDate: tomorrow.toISOString(),
  });
  
  // Send reminders for each appointment (AUTOMATED)
  for (const appointment of appointments) {
    await ghlClient.sendSMS(
      appointment.contactId,
      `Reminder: You have an appointment today at ${appointment.startTime}`
    );
  }
  
  // Check for new leads (AUTOMATED)
  const contacts = await ghlClient.getContacts({
    tags: ['new-lead'],
    limit: 50,
  });
  
  // Create follow-up tasks (AUTOMATED)
  for (const contact of contacts) {
    await ghlClient.createTask({
      title: `Follow up with ${contact.firstName}`,
      contactId: contact.id,
      assignedTo: 'sales-team',
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });
  }
}
