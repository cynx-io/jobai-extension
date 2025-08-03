import { LinkedInProfile, WorkExperience, Education, PageType } from './types';

class LinkedInExtractor {
  private pageType: PageType = PageType.OTHER;

  constructor() {
    this.init();
  }

  private init(): void {
    this.detectPageType();
    if (this.pageType === PageType.PROFILE) {
      this.injectGenerateResumeButton();
    }
  }

  private detectPageType(): void {
    const url = window.location.pathname;
    
    if (url.includes('/in/')) {
      this.pageType = PageType.PROFILE;
    } else if (url.includes('/jobs/view/')) {
      this.pageType = PageType.JOB;
    } else {
      this.pageType = PageType.OTHER;
    }
  }

  private injectGenerateResumeButton(): void {
    const targetSelector = '.pv-top-card-v2-ctas, .pv-top-card__actions, .ph5.pb5';
    const target = document.querySelector(targetSelector);
    
    if (!target || document.getElementById('cynxio-generate-resume-btn')) {
      return;
    }

    const button = document.createElement('button');
    button.id = 'cynxio-generate-resume-btn';
    button.className = 'artdeco-button artdeco-button--2 artdeco-button--primary ember-view';
    button.innerHTML = `
      <span class="artdeco-button__text">
        Generate Resume with Rizzume
      </span>
    `;
    
    button.style.marginTop = '12px';
    button.style.background = 'transparent';
    button.style.border = '3px solid transparent';
    button.style.borderRadius = '8px';
    button.style.backgroundImage = 'linear-gradient(white, white), linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    button.style.backgroundOrigin = 'border-box';
    button.style.backgroundClip = 'padding-box, border-box';
    button.style.color = '#667eea';
    button.style.cursor = 'pointer';
    button.style.fontSize = '16px';
    button.style.fontWeight = '600';
    button.style.padding = '12px 24px';
    button.style.transition = 'all 0.3s ease';
    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    
    button.addEventListener('click', () => this.handleGenerateResume());
    
    target.appendChild(button);
  }

  private async handleGenerateResume(): Promise<void> {
    const button = document.getElementById('cynxio-generate-resume-btn') as HTMLButtonElement;
    if (!button) return;

    button.disabled = true;
    button.innerHTML = '<span class="artdeco-button__text">Extracting data...</span>';

    try {
      const profileData = this.extractProfileData();
      await this.sendToCynxio(profileData);
      
      button.innerHTML = '<span class="artdeco-button__text">✓ Sent to Rizzume</span>';
      button.style.color = '#10b981';
      button.style.backgroundImage = 'linear-gradient(white, white), linear-gradient(135deg, #10b981 0%, #059669 100%)';
      setTimeout(() => {
        button.disabled = false;
        button.innerHTML = '<span class="artdeco-button__text">Generate Resume with Rizzume</span>';
        button.style.color = '#667eea';
        button.style.backgroundImage = 'linear-gradient(white, white), linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      }, 2000);
    } catch (error) {
      console.error('Error extracting profile data:', error);
      button.innerHTML = '<span class="artdeco-button__text">Error - Try again</span>';
      button.style.color = '#ef4444';
      button.style.backgroundImage = 'linear-gradient(white, white), linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
      button.disabled = false;
      setTimeout(() => {
        button.innerHTML = '<span class="artdeco-button__text">Generate Resume with Rizzume</span>';
        button.style.color = '#667eea';
        button.style.backgroundImage = 'linear-gradient(white, white), linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      }, 3000);
    }
  }

  private extractProfileData(): LinkedInProfile {
    const name = this.extractName();
    const headline = this.extractHeadline();
    const location = this.extractLocation();
    const about = this.extractAbout();
    const experience = this.extractExperience();
    const education = this.extractEducation();
    const skills = this.extractSkills();

    return {
      name,
      headline,
      location,
      about,
      experience,
      education,
      skills
    };
  }

  private extractName(): string {
    const selectors = [
      'h1.text-heading-xlarge',
      '.pv-top-card--list h1',
      '.pv-text-details__left-panel h1'
    ];
    
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element?.textContent?.trim()) {
        return element.textContent.trim();
      }
    }
    return '';
  }

  private extractHeadline(): string {
    const selectors = [
      '.text-body-medium.break-words',
      '.pv-top-card--list .text-body-medium',
      '.pv-text-details__left-panel .text-body-medium'
    ];
    
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element?.textContent?.trim()) {
        return element.textContent.trim();
      }
    }
    return '';
  }

  private extractLocation(): string {
    const selectors = [
      '.text-body-small.inline.t-black--light.break-words',
      '.pv-top-card--list .text-body-small',
      '.pv-text-details__left-panel .text-body-small'
    ];
    
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element?.textContent?.trim()) {
        return element.textContent.trim();
      }
    }
    return '';
  }

  private extractAbout(): string {
    const aboutSection = document.querySelector('#about + * .pv-shared-text-with-see-more');
    return aboutSection?.textContent?.trim() || '';
  }

  private extractExperience(): WorkExperience[] {
    const experiences: WorkExperience[] = [];
    const experienceSection = document.querySelector('#experience + *');
    
    if (!experienceSection) return experiences;

    const experienceItems = experienceSection.querySelectorAll('.pvs-list__item--with-top-padding');
    
    experienceItems.forEach(item => {
      const companyElement = item.querySelector('.t-14.t-normal span[aria-hidden="true"]');
      const roleElement = item.querySelector('.t-16.t-black span[aria-hidden="true"]');
      const durationElement = item.querySelector('.t-14.t-black--light span[aria-hidden="true"]');
      const descriptionElement = item.querySelector('.pv-shared-text-with-see-more span[aria-hidden="true"]');
      
      if (roleElement && companyElement) {
        const duration = durationElement?.textContent?.trim() || '';
        const [startDate, endDate] = this.parseDuration(duration);
        
        experiences.push({
          company: companyElement.textContent?.trim() || '',
          role: roleElement.textContent?.trim() || '',
          startDate,
          endDate,
          current: duration.toLowerCase().includes('present'),
          description: descriptionElement?.textContent?.trim() || ''
        });
      }
    });

    return experiences;
  }

  private extractEducation(): Education[] {
    const education: Education[] = [];
    const educationSection = document.querySelector('#education + *');
    
    if (!educationSection) return education;

    const educationItems = educationSection.querySelectorAll('.pvs-list__item--with-top-padding');
    
    educationItems.forEach(item => {
      const schoolElement = item.querySelector('.t-16.t-black span[aria-hidden="true"]');
      const degreeElement = item.querySelector('.t-14.t-normal span[aria-hidden="true"]');
      const durationElement = item.querySelector('.t-14.t-black--light span[aria-hidden="true"]');
      
      if (schoolElement) {
        const duration = durationElement?.textContent?.trim() || '';
        const [startDate, endDate] = this.parseDuration(duration);
        const degreeText = degreeElement?.textContent?.trim() || '';
        const [degree, field] = this.parseDegreeField(degreeText);
        
        education.push({
          school: schoolElement.textContent?.trim() || '',
          degree,
          field,
          startDate,
          endDate
        });
      }
    });

    return education;
  }

  private extractSkills(): string[] {
    const skills: string[] = [];
    const skillsSection = document.querySelector('#skills + *');
    
    if (!skillsSection) return skills;

    const skillItems = skillsSection.querySelectorAll('.t-16.t-black span[aria-hidden="true"]');
    
    skillItems.forEach(item => {
      const skill = item.textContent?.trim();
      if (skill) {
        skills.push(skill);
      }
    });

    return skills;
  }

  private parseDuration(duration: string): [string, string] {
    const parts = duration.split(' - ');
    const startDate = parts[0]?.trim() || '';
    const endDate = parts[1]?.trim() || '';
    return [startDate, endDate];
  }

  private parseDegreeField(degreeText: string): [string, string] {
    const parts = degreeText.split(',');
    const degree = parts[0]?.trim() || '';
    const field = parts[1]?.trim() || '';
    return [degree, field];
  }

  private async sendToCynxio(profileData: LinkedInProfile): Promise<void> {
    try {
      await chrome.runtime.sendMessage({
        type: 'LINKEDIN_DATA',
        data: profileData
      });
    } catch (error) {
      console.error('Error sending data to Rizzume:', error);
      throw error;
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new LinkedInExtractor());
} else {
  new LinkedInExtractor();
}

let currentUrl = window.location.href;
const observer = new MutationObserver(() => {
  if (window.location.href !== currentUrl) {
    currentUrl = window.location.href;
    setTimeout(() => new LinkedInExtractor(), 1000);
  }
});

observer.observe(document.body, { childList: true, subtree: true });