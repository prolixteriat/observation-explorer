export function validateOccurrenceSearchApiUrl(apiUrl: string): string | Error {
    const url = new URL(apiUrl);
    const params = url.searchParams;
  
    // Check if the URL has any parameters other than nbn_loading, q, or fq
    const allowedParams = ['nbn_loading', 'q', 'fq'];
    const invalidParams = Array.from(params.keys()).filter(key => !allowedParams.includes(key));
    if (invalidParams.length > 0) {
      return new Error(`Invalid URL parameters: ${invalidParams.join(', ')}`);
    }
  
    // Remove nbn_loading=true
    params.delete('nbn_loading');
  
    return url.toString();
  }
  