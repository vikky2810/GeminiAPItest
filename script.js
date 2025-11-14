console.log('DEBUG: Script.js loaded');
const InputKey = document.getElementById('api-key');
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`;
const form = document.getElementById('api-form');

console.log('DEBUG: DOM elements initialized', {
    InputKey: InputKey ? 'found' : 'not found',
    form: form ? 'found' : 'not found',
    API_URL: API_URL
});

form.addEventListener('submit', async (e) => {
    console.log('DEBUG: Form submit event triggered');
    e.preventDefault();
    console.log('DEBUG: Default form submission prevented');
    
    const apiKey = InputKey.value.trim();
    console.log('DEBUG: API key retrieved from input', {
        rawValue: InputKey.value,
        trimmedValue: apiKey,
        length: apiKey.length
    });
    
    if (!apiKey) {
        console.log('DEBUG: API key validation failed - empty key');
        showResult('Please enter an API key', 'error');
        return;
    }
    
    console.log('DEBUG: API key validation passed');
    const submitButton = form.querySelector('button[type="submit"]');
    console.log('DEBUG: Submit button found', submitButton ? 'yes' : 'no');
    
    submitButton.disabled = true;
    submitButton.textContent = 'Testing...';
    console.log('DEBUG: Button state updated - disabled and text changed to "Testing..."');
    
    try {
        console.log('DEBUG: Calling checkApiValidity function with API key');
        const result = await checkApiValidity(apiKey);
        console.log('DEBUG: checkApiValidity returned', result);
        
        if (result.isValid) {
            console.log('DEBUG: API key is valid - showing success message');
            showResult('API key is valid! Connection successful.', 'success');
        } else {
            console.log('DEBUG: API key validation failed - showing error message');
            const errorMsg = result.errorMessage || 'API key is invalid or an error occurred.';
            console.log('DEBUG: Error message to display', errorMsg);
            showResult(errorMsg, 'error');
        }
    } catch (error) {
        console.log('DEBUG: Exception caught in form submit handler', {
            errorName: error.name,
            errorMessage: error.message,
            errorStack: error.stack
        });
        showResult(`Error: ${error.message}`, 'error');
    } finally {
        console.log('DEBUG: Finally block - resetting button state');
        submitButton.disabled = false;
        submitButton.textContent = 'Test API';
        console.log('DEBUG: Button state reset complete');
    }
});

async function checkApiValidity(apiKey) {
    console.log('DEBUG: checkApiValidity function called');
    console.log('DEBUG: API key parameter', {
        length: apiKey ? apiKey.length : 0,
        firstChars: apiKey ? apiKey.substring(0, 10) + '...' : 'null',
        lastChars: apiKey && apiKey.length > 10 ? '...' + apiKey.substring(apiKey.length - 5) : 'null'
    });
    
    const requestBody = {
        contents: [{
            parts: [{
                text: "Explain how AI works in a few words"
            }]
        }]
    };
    
    console.log('DEBUG: Request body prepared', requestBody);
    console.log('DEBUG: Request body JSON stringified:', JSON.stringify(requestBody, null, 2));
    console.log('DEBUG: Request URL', API_URL);
    console.log('DEBUG: Request method', 'POST');
    
    const requestHeaders = {
        'x-goog-api-key': apiKey,
        'Content-Type': 'application/json'
    };
    console.log('DEBUG: Request headers prepared', {
        hasApiKey: !!requestHeaders['x-goog-api-key'],
        contentType: requestHeaders['Content-Type']
    });
    
    try {
        console.log('DEBUG: Initiating fetch request to Gemini API');
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: requestHeaders,
            body: JSON.stringify(requestBody)
        });
        
        console.log('DEBUG: Fetch request completed', {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok,
            headers: Object.fromEntries(response.headers.entries())
        });
        
        console.log('DEBUG: Parsing response as JSON');
        const data = await response.json();
        console.log('DEBUG: Response JSON parsed', {
            hasCandidates: !!data.candidates,
            candidatesLength: data.candidates ? data.candidates.length : 0,
            hasError: !!data.error,
            fullResponse: data
        });
        
        if (!response.ok) {
            console.log('DEBUG: Response not OK - API error detected');
            console.log('DEBUG: HTTP Status Code', response.status);
            console.log('DEBUG: HTTP Status Text', response.statusText);
            
            let errorMessage = `HTTP ${response.status}: ${response.statusText || 'Service Unavailable'}`;
            
            if (data.error) {
                console.log('DEBUG: Error object found in response');
                console.log('DEBUG: Error details:', {
                    code: data.error.code,
                    message: data.error.message,
                    status: data.error.status,
                    details: data.error.details
                });
                console.log('DEBUG: Full error object:', JSON.stringify(data.error, null, 2));
                
                if (data.error.message) {
                    errorMessage = `API Error: ${data.error.message}`;
                }
                if (data.error.status) {
                    errorMessage += ` (${data.error.status})`;
                }
            } else {
                console.log('DEBUG: No error object in response, but status is not OK');
            }
            
            console.error('DEBUG: Full API Error response:', JSON.stringify(data, null, 2));
            console.log('DEBUG: Returning error result with message:', errorMessage);
            return { isValid: false, errorMessage: errorMessage };
        }
        
        console.log('DEBUG: Response OK - checking for candidates');
        if (data.candidates && data.candidates.length > 0) {
            console.log('DEBUG: Candidates found - API key is valid');
            console.log('DEBUG: First candidate', data.candidates[0]);
            console.log('DEBUG: Full success response:', data);
            return { isValid: true, errorMessage: null };
        }
        
        console.log('DEBUG: No candidates in response - API key may be invalid');
        return { isValid: false, errorMessage: 'No candidates in API response. API key may be invalid.' };
    } catch (error) {
        console.log('DEBUG: Exception caught in checkApiValidity', {
            errorName: error.name,
            errorMessage: error.message,
            errorStack: error.stack
        });
        console.error('DEBUG: Request failed with error:', error);
        throw new Error('Failed to connect to API');
    }
}

function showResult(message, type) {
    console.log('DEBUG: showResult function called', {
        message: message,
        type: type
    });
    
    const result = document.getElementById('result');
    console.log('DEBUG: Result element found', result ? 'yes' : 'no');
    
    if (!result) {
        console.log('DEBUG: ERROR - Result element not found in DOM');
        return;
    }
    
    console.log('DEBUG: Clearing previous result classes');
    result.classList.remove('show', 'success', 'error', 'info');
    console.log('DEBUG: Previous classes cleared');
    
    console.log('DEBUG: Setting result innerHTML with message');
    result.innerHTML = `<p>${message}</p>`;
    console.log('DEBUG: Adding CSS classes', {
        show: 'show',
        type: type
    });
    
    result.classList.add('show');
    result.classList.add(type);
    console.log('DEBUG: CSS classes added successfully');
    console.log('DEBUG: Result element current classes', result.className);
    console.log('DEBUG: Result will remain visible until next test');
}