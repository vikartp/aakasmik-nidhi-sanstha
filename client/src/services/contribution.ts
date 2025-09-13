import api from './api';

export interface ContributionPayload {
  userId: string;
  screenshotId?: string;
  amount: number;
  contributionDate: Date;
}

export interface Contribution {
  _id: string;
  userId: string; // This contribution belongs to member/user ID
  amount: number; // Amount contributed
  verifiedBy: string; // Name of the admin who verified the contribution
  screenshotId?: string; // Optional screenshot ID if a screenshot is associated with the contribution
  contributionDate: string; // Date of the contributio // Date when the contribution was last updated
}

export async function createContribution(payload: ContributionPayload) {
  const response = await api.post('/contributions', payload);
  return response.data;
}

export async function getContributionsByUser(
  userId: string
): Promise<Contribution[]> {
  const response = await api.get(`/contributions/${userId}`);
  return response.data;
}

export async function getContributionsByYearAndMonth(
  year: number,
  month: string
) {
  const response = await api.get(`/contributions/year/${year}/month/${month}`);
  return response.data;
}

export async function getTotal(): Promise<number> {
  const response = await api.get('/contributions/total-amount');
  return response.data.total;
}

export async function deleteContribution(id: string) {
  const response = await api.delete(`/contributions/${id}`);
  return response.data;
}

export async function getContributionsPDFUrl(year: number, month: string): Promise<string> {
  // Use the same logic as api.ts to determine the correct base URL
  const isLocalhost = window.location.hostname === 'localhost';
  const baseUrl = isLocalhost
    ? 'http://localhost:5000'
    : 'https://aakasmik-nidhi-backend.onrender.com';
  
  return `${baseUrl}/contributions/pdf/${year}/${month}`;
}

export async function downloadContributionsPDF(year: number, month: string) {
  const response = await api.get(`/contributions/pdf/${year}/${month}`, {
    responseType: 'blob', // Important for file downloads
  });
  
  const blob = new Blob([response.data], { type: 'application/pdf' });
  const fileName = `Aakasmik-Nidhi-${year}-${month}.pdf`;
  
  // Check if we're in a mobile app environment (Expo WebView)
  const isInWebView = window.navigator.userAgent.includes('Mobile') || 
                     window.navigator.userAgent.includes('Android') || 
                     window.navigator.userAgent.includes('iPhone') ||
                     !('showSaveFilePicker' in window); // No File System Access API
  
  if (isInWebView) {
    // Try Web Share API first (modern mobile browsers)
    if ('share' in navigator && navigator.share) {
      try {
        // Convert blob to File for sharing
        const file = new File([blob], fileName, { type: 'application/pdf' });
        
        // Check if files can be shared
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'Aakasmik Nidhi Contribution Report',
            text: `Monthly contribution report for ${year}-${month}`,
          });
          return response.data;
        }
      } catch (shareError) {
        console.log('Share API failed, falling back to alternative method', shareError);
      }
    }
    
    // Fallback: Open PDF in new tab/window
    const url = window.URL.createObjectURL(blob);
    
    // Try to open in new window first
    const newWindow = window.open(url, '_blank');
    
    if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
      // If popup is blocked, try alternative methods
      
      // Method 1: Try to navigate to blob URL
      try {
        window.location.href = url;
      } catch (navError) {
        console.log('Navigation failed, using iframe method', navError);
        // Method 2: Create a hidden iframe
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = url;
        document.body.appendChild(iframe);
        
        // Remove iframe after some time
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 5000);
      }
    }
    
    // Clean up after a delay
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 15000);
  } else {
    // For desktop browsers: Use traditional download approach
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
  
  return response.data;
}
