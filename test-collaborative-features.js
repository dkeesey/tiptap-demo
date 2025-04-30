/**
 * test-collaborative-features.js
 * Automated testing script for TipTap Collaborative Editor
 * 
 * This script uses Puppeteer to automate testing of collaborative features
 * by simulating multiple users interacting with the editor.
 */

const puppeteer = require('puppeteer');
const { v4: uuidv4 } = require('uuid');

// Test configuration
const config = {
  appUrl: process.env.APP_URL || 'https://tiptap-demo.vercel.app',
  testTimeout: 60000,
  userCount: 2,
  testSessions: [
    {
      name: 'Basic text entry and synchronization',
      actions: [
        { user: 0, action: 'type', text: 'Hello from User 1! ' },
        { user: 1, action: 'type', text: 'Hello from User 2! ' },
        { user: 0, action: 'wait', ms: 1000 },
        { user: 0, action: 'assertContent', contains: ['Hello from User 1', 'Hello from User 2'] }
      ]
    },
    {
      name: 'Formatting and styles',
      actions: [
        { user: 0, action: 'type', text: 'This text will be bold. ' },
        { user: 0, action: 'selectLastWord' },
        { user: 0, action: 'clickButton', selector: '[data-test="bold-button"]' },
        { user: 1, action: 'wait', ms: 1000 },
        { user: 1, action: 'assertHTML', contains: '<strong>bold</strong>' },
        { user: 1, action: 'type', text: 'This will be italic. ' },
        { user: 1, action: 'selectLastWord' },
        { user: 1, action: 'clickButton', selector: '[data-test="italic-button"]' },
        { user: 0, action: 'wait', ms: 1000 },
        { user: 0, action: 'assertHTML', contains: '<em>italic</em>' }
      ]
    },
    {
      name: 'Cursor position tracking',
      actions: [
        { user: 0, action: 'type', text: 'Check cursor positions. ' },
        { user: 1, action: 'wait', ms: 1000 },
        { user: 1, action: 'assertPresence', selector: '.collaboration-cursor' }
      ]
    }
  ]
};

// Main test function
async function runCollaborativeTests() {
  console.log(`Starting collaborative tests with ${config.userCount} users`);
  
  // Generate unique room ID for this test
  const roomId = uuidv4();
  const testUrl = `${config.appUrl}?room=${roomId}`;
  console.log(`Test room URL: ${testUrl}`);
  
  // Launch browsers for each user
  const browsers = [];
  const pages = [];
  
  try {
    for (let i = 0; i < config.userCount; i++) {
      console.log(`Launching browser for User ${i+1}`);
      const browser = await puppeteer.launch({ 
        headless: false,
        args: ['--window-size=1280,800']
      });
      browsers.push(browser);
      
      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 800 });
      pages.push(page);
      
      // Set user name for identification
      await page.evaluateOnNewDocument((userName) => {
        localStorage.setItem('user-name', userName);
        localStorage.setItem('user-color', i === 0 ? 'hsl(200, 70%, 50%)' : 'hsl(0, 70%, 50%)');
      }, `Test User ${i+1}`);
      
      // Navigate to test URL
      await page.goto(testUrl);
      
      // Wait for editor to initialize
      await page.waitForSelector('.ProseMirror', { timeout: 10000 });
      console.log(`User ${i+1} connected to room`);
    }
    
    // Run each test session
    for (const session of config.testSessions) {
      console.log(`\n--- Test session: ${session.name} ---`);
      
      for (const step of session.actions) {
        const page = pages[step.user];
        const userNum = step.user + 1;
        
        switch (step.action) {
          case 'type':
            console.log(`User ${userNum} types: "${step.text}"`);
            await page.click('.ProseMirror');
            await page.type('.ProseMirror', step.text);
            break;
            
          case 'wait':
            console.log(`Waiting ${step.ms}ms...`);
            await new Promise(r => setTimeout(r, step.ms));
            break;
            
          case 'selectLastWord':
            console.log(`User ${userNum} selects last word`);
            await page.evaluate(() => {
              const editor = document.querySelector('.ProseMirror');
              const selection = window.getSelection();
              const text = editor.textContent;
              const lastSpace = text.trimEnd().lastIndexOf(' ');
              const range = document.createRange();
              let textNode;
              
              // Find the last text node
              const walker = document.createTreeWalker(
                editor,
                NodeFilter.SHOW_TEXT,
                null,
                false
              );
              
              while (walker.nextNode()) {
                textNode = walker.currentNode;
              }
              
              if (textNode) {
                range.setStart(textNode, lastSpace + 1);
                range.setEnd(textNode, textNode.length);
                selection.removeAllRanges();
                selection.addRange(range);
              }
            });
            break;
            
          case 'clickButton':
            console.log(`User ${userNum} clicks button: ${step.selector}`);
            await page.click(step.selector);
            break;
            
          case 'assertContent':
            console.log(`User ${userNum} checking content`);
            const content = await page.evaluate(() => {
              return document.querySelector('.ProseMirror').textContent;
            });
            
            for (const text of step.contains) {
              if (!content.includes(text)) {
                throw new Error(`Expected to find "${text}" in content, but it was not present!`);
              }
            }
            console.log(`✓ Content verification successful`);
            break;
            
          case 'assertHTML':
            console.log(`User ${userNum} checking HTML`);
            const html = await page.evaluate(() => {
              return document.querySelector('.ProseMirror').innerHTML;
            });
            
            for (const text of step.contains) {
              if (!html.includes(text)) {
                throw new Error(`Expected to find "${text}" in HTML, but it was not present!`);
              }
            }
            console.log(`✓ HTML verification successful`);
            break;
            
          case 'assertPresence':
            console.log(`User ${userNum} checking for element: ${step.selector}`);
            const elements = await page.$$(step.selector);
            if (elements.length === 0) {
              throw new Error(`Expected to find elements matching "${step.selector}", but none were found!`);
            }
            console.log(`✓ Found ${elements.length} elements matching ${step.selector}`);
            break;
        }
      }
      
      console.log(`✓ Test session passed: ${session.name}`);
    }
    
    console.log("\n🎉 All collaborative tests passed successfully!");
    
  } catch (error) {
    console.error(`❌ Test failed: ${error.message}`);
    // Optional: Take screenshots of all browsers when a test fails
    for (let i = 0; i < pages.length; i++) {
      await pages[i].screenshot({ path: `error-user-${i+1}.png` });
      console.log(`Saved screenshot for User ${i+1}: error-user-${i+1}.png`);
    }
  } finally {
    // Close all browsers
    for (const browser of browsers) {
      await browser.close();
    }
  }
}

// Run the tests
runCollaborativeTests().catch(console.error);
