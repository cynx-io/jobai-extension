import { LinkedInProfile, ExtensionMessage } from './types';

class CynxioIntegration {
  private apiEndpoint = '/api/linkedin-import';
  private notificationElement: HTMLElement | null = null;

  constructor() {
    this.init();
  }

  private init(): void {
    chrome.runtime.onMessage.addListener(this.handleMessage.bind(this));
    this.createNotificationContainer();
  }

  private handleMessage(
    message: ExtensionMessage,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ): void {
    if (message.type === 'LINKEDIN_DATA' && message.data) {
      this.processLinkedInData(message.data);
      sendResponse({ success: true });
    }
  }

  private async processLinkedInData(profileData: LinkedInProfile): Promise<void> {
    this.showNotification('Processing LinkedIn data...', 'info');

    try {
      const result = await this.sendToApi(profileData);
      
      if (result.success) {
        this.showNotification('LinkedIn data imported successfully!', 'success');
        this.populateResumeForm(profileData);
      } else {
        this.showNotification('Failed to import LinkedIn data', 'error');
      }
    } catch (error) {
      console.error('Error processing LinkedIn data:', error);
      this.showNotification('Error importing LinkedIn data', 'error');
    }
  }

  private async sendToApi(profileData: LinkedInProfile): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          profile: profileData,
          source: 'linkedin_extension'
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, ...data };
    } catch (error) {
      console.error('API request error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  private populateResumeForm(profileData: LinkedInProfile): void {
    setTimeout(() => {
      this.fillBasicInfo(profileData);
      this.fillExperience(profileData.experience);
      this.fillEducation(profileData.education);
      this.fillSkills(profileData.skills);
    }, 1000);
  }

  private fillBasicInfo(profileData: LinkedInProfile): void {
    this.fillField('input[name="name"], input[id="name"], input[placeholder*="name" i]', profileData.name);
    this.fillField('input[name="headline"], input[id="headline"], input[placeholder*="headline" i]', profileData.headline);
    this.fillField('input[name="location"], input[id="location"], input[placeholder*="location" i]', profileData.location);
    this.fillField('textarea[name="about"], textarea[id="about"], textarea[placeholder*="about" i]', profileData.about || '');
  }

  private fillExperience(experiences: any[]): void {
    const experienceContainer = document.querySelector('[data-section="experience"], .experience-section, #experience');
    
    if (!experienceContainer || experiences.length === 0) return;

    experiences.forEach((exp, index) => {
      this.fillField(`input[name="experience[${index}].company"]`, exp.company);
      this.fillField(`input[name="experience[${index}].role"]`, exp.role);
      this.fillField(`input[name="experience[${index}].startDate"]`, exp.startDate);
      this.fillField(`input[name="experience[${index}].endDate"]`, exp.endDate);
      this.fillField(`textarea[name="experience[${index}].description"]`, exp.description);
    });
  }

  private fillEducation(education: any[]): void {
    const educationContainer = document.querySelector('[data-section="education"], .education-section, #education');
    
    if (!educationContainer || education.length === 0) return;

    education.forEach((edu, index) => {
      this.fillField(`input[name="education[${index}].school"]`, edu.school);
      this.fillField(`input[name="education[${index}].degree"]`, edu.degree);
      this.fillField(`input[name="education[${index}].field"]`, edu.field);
      this.fillField(`input[name="education[${index}].startDate"]`, edu.startDate);
      this.fillField(`input[name="education[${index}].endDate"]`, edu.endDate);
    });
  }

  private fillSkills(skills: string[]): void {
    const skillsField = document.querySelector('textarea[name="skills"], input[name="skills"], [data-field="skills"]') as HTMLInputElement | HTMLTextAreaElement;
    
    if (skillsField && skills.length > 0) {
      const skillsText = skills.join(', ');
      this.fillField('textarea[name="skills"], input[name="skills"]', skillsText);
    }
  }

  private fillField(selector: string, value: string): void {
    const field = document.querySelector(selector) as HTMLInputElement | HTMLTextAreaElement;
    
    if (field && value) {
      field.value = value;
      field.dispatchEvent(new Event('input', { bubbles: true }));
      field.dispatchEvent(new Event('change', { bubbles: true }));
      
      if (field.getAttribute('data-react')) {
        const reactEvent = new Event('input', { bubbles: true });
        Object.defineProperty(reactEvent, 'target', { value: field });
        field.dispatchEvent(reactEvent);
      }
    }
  }

  private createNotificationContainer(): void {
    if (document.getElementById('cynxio-extension-notifications')) return;

    const container = document.createElement('div');
    container.id = 'cynxio-extension-notifications';
    container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    
    document.body.appendChild(container);
  }

  private showNotification(message: string, type: 'info' | 'success' | 'error'): void {
    const container = document.getElementById('cynxio-extension-notifications');
    if (!container) return;

    const notification = document.createElement('div');
    notification.style.cssText = `
      padding: 12px 16px;
      margin-bottom: 8px;
      border-radius: 4px;
      color: white;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transform: translateX(100%);
      transition: transform 0.3s ease;
      max-width: 300px;
      word-wrap: break-word;
    `;

    const colors = {
      info: '#2196F3',
      success: '#4CAF50',
      error: '#F44336'
    };

    notification.style.backgroundColor = colors[type];
    notification.textContent = message;

    container.appendChild(notification);

    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 10);

    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new CynxioIntegration());
} else {
  new CynxioIntegration();
}