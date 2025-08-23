# Mike's AWS Builder Challenge Website

A sleek, neon‑glow personal site built for the **AWS Builder Challenge** — hosted on **AWS Amplify**, animated with a starfield + digital rain background, and wired to a **serverless contact form** via **AWS Lambda + SNS**.  
**Built with ❤️‍🔥 on AWS.**

## ✨ Features
- **Hero card** with photo pulse/glow and subtle halo.
- **About** + **Fun Facts** cards with soft glow/pulse to match the aesthetic.
- **DIY Gallery** (images + videos) with a lightweight lightbox.
- **Digital Rain** + **Starfield** canvases (calm, performant, reduced‑motion friendly).
- **Serverless Contact Form** → **Lambda Function URL** → **SNS** email.
- Optional **Geo hello chip** using `CloudFront-Viewer-Country` or `ipapi.co` fallback.
- Deployed on **AWS Amplify** (static hosting + CDN).

## 🧱 Tech Stack
- **HTML / CSS / Vanilla JS** (no frameworks)
- **AWS Amplify** (hosting)
- **AWS Lambda (Function URL)** (contact form)
- **Amazon SNS** (email notifications)

## 🚀 Quick Start (Local)
```bash
# clone your repo
git clone <your-repo-url>
cd <your-repo>
# serve locally (choose one)
python3 -m http.server 5500
# or
npx serve -l 5500
```
Visit `http://localhost:5500`.

## 🔧 Configure the Contact Form
1. **Create an SNS Topic** (e.g., `contact-form-notifications`) and **subscribe your email**. Confirm the subscription email from SNS.
2. **Create a Lambda** (Python) with the following minimal handler (ensure the role has `sns:Publish` to your topic):  
   ```py
   import json, boto3
   def lambda_handler(event, context):
       body = json.loads(event.get('body') or '{}')
       for k in ('name','email','message'):
           if not body.get(k): return {'statusCode':400,'body':json.dumps({'error':'Missing required fields'})}
       msg = f"Contact Form\n\nName: {body['name']}\nEmail: {body['email']}\n\nMessage:\n{body['message']}"
       boto3.client('sns').publish(
           TopicArn='arn:aws:sns:us-east-1:YOUR_ACCOUNT_ID:contact-form-notifications',
           Subject=f"Contact Form: {body['name']}",
           Message=msg
       )
       return {'statusCode':200,'headers':{'Content-Type':'application/json'},'body':json.dumps({'ok':True})}
   ```
3. **Create a Function URL** (Auth: `NONE`) and set **CORS**:
   - Allow origins: `*` (or your Amplify domain for stricter)
   - Allow headers: `content-type`
   - Allow methods: `POST`
4. **Plug the Function URL into the site**:  
   In `index.html`, the contact form tag contains a `data-lambda` attribute. Set it to your **exact** Function URL:  
   ```html
   <form id="contact-form" class="contact-form" novalidate
         data-lambda="https://<your-func-id>.lambda-url.us-east-1.on.aws/">
   ```
5. **Deploy** (Amplify): connect your repo and build. Push changes and Amplify will publish.

> If you see “Network error”: double‑check the **Function URL** (copy exact), **CORS** (allow `content-type`, `POST`), and that your Lambda **role** can publish to SNS. Also verify your **SNS email subscription** is confirmed.

## 📁 Project Structure
```
.
├── index.html      # Markup + data-lambda config
├── styles.css      # Glow/pulse neon theme + layout
├── app.js          # Animations, lightbox, and contact form fetch
└── media/          # Images/videos for the DIY gallery
```

## 🔒 Security Notes
- Function URL is public (Auth: NONE). Validate inputs in Lambda (already enforced).
- For production, consider restricting CORS to your Amplify domain and enabling spam‑control (e.g., rate limit, captcha, or email verification).

## ♿ Accessibility
- Motion respects `prefers-reduced-motion`.
- Focus management and keyboard nav in the lightbox.
- Sufficient contrast against the dark theme.

## 🧩 Credits
- Icons: inline SVGs.
- Geo flag via regional indicator trick.
- Inspiration: classic **SNES** vibes + cyber‑neon.

## 🙌 About Mike
I lead with **connection**, contribute with **purpose**, and stay **curious**.  
Builder profile: https://builder.aws/community/@mikear815

---

### License
MIT © Michael Ramirez
```
