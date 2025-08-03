import { ExtensionMessage } from './types';

class BackgroundService {
  constructor() {
    this.init();
  }

  private init(): void {
    chrome.runtime.onMessage.addListener(this.handleMessage.bind(this));
    chrome.tabs.onUpdated.addListener(this.handleTabUpdate.bind(this));
  }

  private async handleMessage(
    message: ExtensionMessage,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ): Promise<void> {
    switch (message.type) {
      case 'TAB_CHECK':
        await this.handleTabCheck(sendResponse);
        break;
      case 'TAB_FOCUS':
        await this.handleTabFocus(message.tabId, sendResponse);
        break;
      case 'LINKEDIN_DATA':
        await this.handleLinkedInData(message.data, sendResponse);
        break;
    }
  }

  private async handleTabCheck(sendResponse: (response?: any) => void): Promise<void> {
    try {
      const tabs = await chrome.tabs.query({ url: 'https://jobai.cynxio.com/*' });
      sendResponse({ 
        hasCynxioTab: tabs.length > 0,
        tabId: tabs.length > 0 ? tabs[0].id : null
      });
    } catch (error) {
      console.error('Error checking for Cynxio tabs:', error);
      sendResponse({ hasCynxioTab: false, tabId: null });
    }
  }

  private async handleTabFocus(tabId: number | undefined, sendResponse: (response?: any) => void): Promise<void> {
    if (!tabId) {
      sendResponse({ success: false, error: 'No tab ID provided' });
      return;
    }

    try {
      await chrome.tabs.update(tabId, { active: true });
      const tab = await chrome.tabs.get(tabId);
      await chrome.windows.update(tab.windowId, { focused: true });
      sendResponse({ success: true });
    } catch (error) {
      console.error('Error focusing tab:', error);
      sendResponse({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  private async handleLinkedInData(data: any, sendResponse: (response?: any) => void): Promise<void> {
    try {
      const tabs = await chrome.tabs.query({ url: 'https://jobai.cynxio.com/*' });
      
      if (tabs.length > 0) {
        await chrome.tabs.update(tabs[0].id!, { active: true });
        
        setTimeout(async () => {
          try {
            await chrome.tabs.sendMessage(tabs[0].id!, {
              type: 'LINKEDIN_DATA',
              data: data
            });
            sendResponse({ success: true, method: 'existing_tab' });
          } catch (error) {
            console.error('Error sending message to existing tab:', error);
            sendResponse({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
          }
        }, 500);
      } else {
        const newTab = await chrome.tabs.create({ 
          url: 'https://jobai.cynxio.com',
          active: true
        });
        
        const tabId = newTab.id!;
        let attempts = 0;
        const maxAttempts = 10;
        
        const sendDataToNewTab = async () => {
          attempts++;
          try {
            await chrome.tabs.sendMessage(tabId, {
              type: 'LINKEDIN_DATA',
              data: data
            });
            sendResponse({ success: true, method: 'new_tab' });
          } catch (error) {
            if (attempts < maxAttempts) {
              setTimeout(sendDataToNewTab, 1000);
            } else {
              console.error('Failed to send data to new tab after max attempts:', error);
              sendResponse({ success: false, error: 'Tab not ready after multiple attempts' });
            }
          }
        };
        
        setTimeout(sendDataToNewTab, 2000);
      }
    } catch (error) {
      console.error('Error handling LinkedIn data:', error);
      sendResponse({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  private handleTabUpdate(tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab): void {
    if (changeInfo.status === 'complete' && tab.url?.includes('jobai.cynxio.com')) {
      console.log('Rizzume target tab loaded:', tabId);
    }
  }
}

new BackgroundService();