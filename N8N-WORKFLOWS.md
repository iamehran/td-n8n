# N8N Workflow Setup Guide

This guide explains how to set up the N8N workflows for AI task enhancement and WhatsApp integration.

## Prerequisites
- N8N Cloud account (or self-hosted)
- OpenAI API key
- Your deployed Next.js app URL
- (Optional) Evolution API for WhatsApp

---

## Workflow 1: Task Enhancement

This workflow is called when a new task is created to enhance the title using AI.

### Setup Steps:

1. **Create New Workflow** in N8N

2. **Add Webhook Node (Trigger)**
   - Method: POST
   - Path: `/task-enhance`
   - Response Mode: "Respond to Webhook"
   - Copy the webhook URL for later

3. **Add OpenAI Node**
   - Operation: Message a Model
   - Model: `gpt-4o-mini`
   - Messages:
     ```json
     [
       {
         "role": "system",
         "content": "You are a task assistant. Take the user's task and make it clearer, more actionable, and add helpful context if relevant. Keep it concise (1-2 sentences max). Return ONLY the enhanced task text, nothing else."
       },
       {
         "role": "user",
         "content": "{{ $json.title }}"
       }
     ]
     ```

4. **Add HTTP Request Node**
   - Method: PATCH
   - URL: `https://your-app.vercel.app/api/tasks`
   - Headers:
     - Content-Type: application/json
   - Body (JSON):
     ```json
     {
       "id": "{{ $('Webhook').item.json.task_id }}",
       "enhanced_title": "{{ $json.message.content }}"
     }
     ```

5. **Add Respond to Webhook Node**
   - Response Code: 200
   - Response Body:
     ```json
     {
       "success": true,
       "enhanced_title": "{{ $json.message.content }}"
     }
     ```

### Test the Workflow:
```bash
curl -X POST https://your-n8n.app.n8n.cloud/webhook/task-enhance \
  -H "Content-Type: application/json" \
  -d '{"task_id": "test-123", "title": "buy milk"}'
```

---

## Workflow 2: WhatsApp Bot

This workflow receives WhatsApp messages via Evolution API and creates tasks.

### How It Works:
1. User links their WhatsApp number in the web app (click "+ link WhatsApp")
2. When they send a WhatsApp message containing `#to-do`, Evolution API forwards it to N8N
3. N8N looks up the user by phone number and creates the task
4. N8N sends a WhatsApp reply confirming the task was added

### Prerequisites:
- Evolution API deployed and connected to YOUR WhatsApp
- User has linked their phone in the web app

### Setup Steps:

1. **Create New Workflow** in N8N

2. **Add Webhook Node (Trigger)**
   - Method: POST
   - Path: `/whatsapp-webhook`
   - Response Mode: "Respond to Webhook"
   - Copy the Production URL (e.g., `https://your-n8n.app.n8n.cloud/webhook/whatsapp-webhook`)

3. **Add IF Node (Filter #to-do)**
   - Conditions:
     - String: `{{ $json.data.message.conversation }}`
     - Operation: Contains
     - Value: `#to-do`

4. **Add Code Node (Extract Task)** - True branch
   ```javascript
   const message = $input.first().json.data.message.conversation || '';
   const remoteJid = $input.first().json.data.key.remoteJid || '';

   // Extract phone number (remove @s.whatsapp.net suffix)
   const phone = remoteJid.replace('@s.whatsapp.net', '');

   // Remove #to-do and clean up the task
   const task = message
     .replace(/#to-?do/gi, '')
     .trim();

   return {
     task,
     phone,
     remoteJid,
     originalMessage: message
   };
   ```

5. **Add HTTP Request Node (Create Task)**
   - Method: POST
   - URL: `https://td-n8n.vercel.app/api/webhook/n8n`
   - Headers:
     - Content-Type: application/json
   - Body (JSON):
     ```json
     {
       "action": "create_task",
       "user_phone": "{{ $('Code').item.json.phone }}",
       "title": "{{ $('Code').item.json.task }}"
     }
     ```

6. **Add IF Node (Check Success)**
   - Conditions:
     - Boolean: `{{ $json.success }}`
     - Operation: is true

7. **Add HTTP Request Node (Send Success Reply)** - True branch
   - Method: POST
   - URL: `https://your-evolution-api.com/message/sendText/your-instance`
   - Headers:
     - Content-Type: application/json
     - apikey: your-evolution-api-key
   - Body (JSON):
     ```json
     {
       "number": "{{ $('Code').item.json.remoteJid }}",
       "text": "Task added: {{ $('Code').item.json.task }}"
     }
     ```

8. **Add HTTP Request Node (Send Error Reply)** - False branch
   - Same URL/headers as above
   - Body (JSON):
     ```json
     {
       "number": "{{ $('Code').item.json.remoteJid }}",
       "text": "Could not add task. Make sure your WhatsApp number is linked at td-n8n.vercel.app"
     }
     ```

9. **Add Respond to Webhook Node**
   - Response Code: 200

### Evolution API Webhook Config:

In your Evolution API instance settings:

1. Go to **Settings** > **Webhook**
2. Set Global Webhook URL: `https://your-n8n.app.n8n.cloud/webhook/whatsapp-webhook`
3. Enable event: **MESSAGES_UPSERT**
4. Save

### Test the Flow:
1. Open your web app, click "+ link WhatsApp", enter your phone number (e.g., `923001234567`)
2. Send a WhatsApp message to your connected Evolution API number: `#to-do buy groceries`
3. You should receive a reply and see the task in your web app

---

## Environment Variables Needed

In your Vercel deployment, add:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
N8N_WEBHOOK_SECRET=your-secret-here (optional)
```

---

## Testing Checklist

- [ ] Create task via web app → appears in database
- [ ] N8N webhook receives task creation event
- [ ] OpenAI enhances the task title
- [ ] Enhanced title updates in database
- [ ] Web app shows enhanced title
- [ ] WhatsApp message with #to-do creates task
- [ ] WhatsApp reply confirms task creation

---

## Troubleshooting

### Task not being enhanced
1. Check N8N workflow execution logs
2. Verify OpenAI API key is valid
3. Check your app's `/api/tasks` endpoint returns 200

### WhatsApp messages not received
1. Verify Evolution API webhook is configured
2. Check Evolution API logs for incoming messages
3. Ensure phone is connected (scan QR if needed)

### CORS errors
- The API routes already handle CORS via Next.js
- If issues persist, check Vercel deployment logs
