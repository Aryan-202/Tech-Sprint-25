I'll help you test these endpoints with Postman. Here's a complete guide:

## **Postman Collection Setup**

### **1. Set up Environment Variables in Postman**
Create a new environment called "AI Resume Builder" with these variables:
```
base_url: http://localhost:3000
api_key: your_openrouter_api_key_here
```

### **2. Collection: AI Resume Builder APIs**

#### **Endpoint 1: Generate Markdown Resume**
```
POST: {{base_url}}/api/generate-markdown
```

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
    "messages": [
        {
            "role": "user",
            "content": "I am John Doe, a senior software engineer with 5 years of experience at Google. I specialize in backend development using Python, Go, and Node.js. I have a Master's in Computer Science from Stanford University. My skills include microservices architecture, cloud computing (AWS, GCP), and database design. I've worked on scaling systems to handle millions of requests. I also have experience mentoring junior engineers."
        }
    ]
}
```

**Expected Response (200 OK):**
```json
{
    "markdown": "# John Doe\n\n**Contact Information**  \nEmail: john.doe@example.com  \nPhone: (123) 456-7890  \nLocation: San Francisco, CA  \n[LinkedIn](https://linkedin.com/in/johndoe) | [GitHub](https://github.com/johndoe) | [Portfolio](https://johndoe.dev)\n\n## Professional Summary\n\nSenior Software Engineer with 5 years of experience at Google, specializing in backend development and scalable system architecture...",
    "filename": "john-doe-2024-12-15.md"
}
```

#### **Endpoint 2: Download Markdown File (POST)**
```
POST: {{base_url}}/api/download-resume
```

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
    "markdown": "# John Doe\n\n## Professional Summary\nSenior Software Engineer with 5 years of experience...",
    "filename": "john-doe-resume.md"
}
```

**Expected Response:**
- Content-Type: `text/markdown`
- Content-Disposition: `attachment; filename="john-doe-resume.md"`
- Binary file download

#### **Endpoint 3: Download Markdown File (GET)**
```
GET: {{base_url}}/api/download-resume?content=%23%20John%20Doe%0A%23%23%20Summary%0ASoftware%20Engineer&filename=test-resume.md
```

**Note:** URL encode your markdown content first. You can use this JavaScript to encode:
```javascript
encodeURIComponent('# John Doe\n## Summary\nSoftware Engineer')
```

#### **Endpoint 4: Chat with AI (Generate JSON Resume)**
```
POST: {{base_url}}/api/chat
```

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
    "messages": [
        {
            "role": "user",
            "content": "Help me create a resume for a software engineer role"
        }
    ],
    "useReasoning": true,
    "format": "json"
}
```

#### **Endpoint 5: Generate Resume Content**
```
POST: {{base_url}}/api/generate-resume
```

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
    "messages": [
        {
            "role": "user",
            "content": "I have 3 years experience as a frontend developer using React and TypeScript. I worked at TechCorp Inc."
        }
    ],
    "useReasoning": true
}
```

## **Postman Test Scripts**

### **Test for Generate Markdown Endpoint:**

Add this test script in Postman for `/api/generate-markdown`:

```javascript
// Test 1: Check response status
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

// Test 2: Check response has required fields
pm.test("Response has markdown content", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('markdown');
    pm.expect(jsonData.markdown).to.be.a('string');
    pm.expect(jsonData.markdown.length).to.be.greaterThan(0);
});

// Test 3: Check filename format
pm.test("Valid filename generated", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('filename');
    pm.expect(jsonData.filename).to.match(/\.md$/);
});

// Test 4: Check markdown structure
pm.test("Markdown contains resume sections", function () {
    const jsonData = pm.response.json();
    const markdown = jsonData.markdown.toLowerCase();
    
    // Check for common resume sections
    const hasHeader = markdown.includes('# ') || markdown.includes('## ');
    const hasContact = markdown.includes('contact') || markdown.includes('email') || markdown.includes('phone');
    const hasExperience = markdown.includes('experience') || markdown.includes('work');
    
    pm.expect(hasHeader).to.be.true;
    pm.expect(hasContact || hasExperience).to.be.true;
});
```

### **Test for Download Endpoint:**

```javascript
// Test for download endpoint
pm.test("Status code is 200 for download", function () {
    pm.response.to.have.status(200);
});

pm.test("Content-Type is markdown", function () {
    pm.expect(pm.response.headers.get('Content-Type')).to.include('text/markdown');
});

pm.test("Has content-disposition header", function () {
    const contentDisposition = pm.response.headers.get('Content-Disposition');
    pm.expect(contentDisposition).to.include('attachment');
    pm.expect(contentDisposition).to.include('.md');
});
```

## **Pre-request Script for Authentication**

If you need to add API key (for OpenRouter), add this pre-request script:

```javascript
// Set OpenRouter API key if needed
const apiKey = pm.environment.get("api_key");
if (apiKey) {
    pm.request.headers.add({
        key: "Authorization",
        value: `Bearer ${apiKey}`
    });
}
```

## **Sample Test Data**

Here are some test payloads you can use:

### **Test 1: Complete Professional Profile**
```json
{
    "messages": [
        {
            "role": "user",
            "content": "Create a resume for Sarah Chen, a data scientist with 4 years at Amazon. She has a PhD in Statistics from MIT. Skills: Python, R, SQL, machine learning, deep learning, AWS, Tableau. She led a team that improved recommendation accuracy by 35%. She wants a job at Google."
        }
    ]
}
```

### **Test 2: Recent Graduate**
```json
{
    "messages": [
        {
            "role": "user",
            "content": "I just graduated with a Bachelor's in Computer Science from University of Washington. I have internship experience at Microsoft for 6 months working on frontend development. I know React, JavaScript, HTML/CSS. I also worked on a capstone project building a mobile app using React Native. Help me create a resume for entry-level software engineer positions."
        }
    ]
}
```

### **Test 3: Career Changer**
```json
{
    "messages": [
        {
            "role": "user",
            "content": "I'm switching from marketing to UX design. I have 5 years marketing experience but recently completed a UX bootcamp. I have portfolio projects including redesigning a e-commerce website and mobile app. I know Figma, Sketch, Adobe XD, and user research methods. Create a resume highlighting my transferable skills."
        }
    ]
}
```

## **Common Issues & Troubleshooting**

### **Issue 1: 400 Bad Request**
**Possible causes:**
- Missing `messages` array
- Invalid JSON format
- Empty messages array

**Solution:** Validate your JSON structure

### **Issue 2: 500 Internal Server Error**
**Possible causes:**
- OpenRouter API key missing or invalid
- Rate limiting
- Model not available

**Solution:** Check environment variables and API key

### **Issue 3: Empty Response**
**Possible causes:**
- AI model timeout
- Token limit exceeded
- Prompt too vague

**Solution:** Simplify the prompt or break into multiple requests

## **Quick Test Commands (curl)**

You can also test with curl before using Postman:

```bash
# Test generate-markdown
curl -X POST http://localhost:3000/api/generate-markdown \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"I am a software engineer"}]}'

# Test download
curl -X POST http://localhost:3000/api/download-resume \
  -H "Content-Type: application/json" \
  -d '{"markdown":"# Test Resume","filename":"test.md"}' \
  -o downloaded.md
```

## **Export Postman Collection**

To export your collection for sharing:
1. Click on the collection
2. Click the three dots (⋯)
3. Select "Export"
4. Choose v2.1 format
5. Save as JSON file

Would you like me to create a complete Postman collection JSON file that you can import directly?