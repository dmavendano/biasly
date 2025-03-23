// Try to select the main article content more precisely
const element = document.querySelector('article') || 
                document.querySelector('.article-content') || 
                document.querySelector('.post-content') || 
                document.querySelector('main') || 
                document.querySelector('.content') || 
                document.body;

// Add styles for displaying results and highlighting and tooltips
const styles = document.createElement('style');
styles.textContent = `
  .bias-result {
    margin: 10px 0;
    padding: 15px;
    border-radius: 4px;
    background-color: #f5f5f5;
    font-family: Arial, sans-serif;
  }
  .bias-item {
    margin: 10px 0;
    padding: 10px;
    border-left: 3px solid #d32f2f;
    background-color: white;
  }
  .original {
    color: #d32f2f;
    font-weight: bold;
  }
  .explanation {
    color: #333;
    margin: 5px 0;
  }
  .revision {
    color: #2e7d32;
    margin-top: 5px;
  }
  .bias-highlight {
    background-color: #ffd7d7;
    cursor: pointer;
    position: relative;
    display: inline;
    transition: background-color 0.3s;
  }

  .bias-highlight:hover {
    background-color: #ffbaba;
  }

  .bias-highlight.replaced {
    background-color: #e8f5e9;
    cursor: pointer;
  }

  .bias-highlight.replaced:hover {
    background-color: #c8e6c9;
  }

  .bias-tooltip {
    visibility: hidden;
    position: absolute;
    z-index: 1000;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    width: 300px;
    padding: 8px;
    background: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    font-family: Arial, sans-serif;
    font-size: 14px;
    line-height: 1.4;
  }

  .bias-highlight:hover .bias-tooltip {
    visibility: visible;
  }

  .bias-explanation {
    color: #d32f2f;
    margin-bottom: 8px;
  }

  .bias-revision {
    color: #2e7d32;
    border-top: 1px solid #eee;
    padding-top: 8px;
    margin-top: 8px;
  }

  .bias-count {
    position: fixed;
    top: 10px;
    right: 10px;
    background: white;
    padding: 8px 12px;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    font-family: Arial, sans-serif;
    z-index: 1000;
  }

  .click-instruction {
    font-size: 12px;
    color: #666;
    font-style: italic;
    margin-top: 4px;
  }
`;
document.head.appendChild(styles);

if (element) {
    // Get text content while preserving some structure
    function extractTextContent(element) {
        let text = '';
        const walk = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
            null,
            false
        );

        let node;
        while (node = walk.nextNode()) {
            if (node.nodeType === Node.TEXT_NODE) {
                const trimmed = node.textContent.trim();
                if (trimmed) text += trimmed + ' ';
            } else if (node.tagName === 'P' || node.tagName === 'DIV' || 
                      node.tagName === 'H1' || node.tagName === 'H2' || 
                      node.tagName === 'H3' || node.tagName === 'LI') {
                text += '\\n';
            }
        }
        return text.trim();
    }

    const text = extractTextContent(element);
    const trimmedText = text.trim();

    // Arrays to store bias information
    const originals = [];
    const explanations = [];
    const revisions = [];

    async function detectBias(text) {
        const prompt = `You are a bias detection expert. Analyze the following text for biased language and political bias. Pay special attention to:

1. Political bias indicators:
   - Loaded terms about politicians or political actions
   - Dramatic or sensationalized descriptions of political events
   - One-sided presentation of political actions
   - Emotionally charged language about political figures
   - Timing implications ("late night", "suddenly", etc.)
   - Implied motivations without evidence

2. Language bias indicators:
   - Loaded or emotionally charged words
   - Dramatic or sensational phrases
   - Implications without evidence
   - One-sided presentations
   - Exaggerated claims
   - Inflammatory language

For EACH instance of bias found, you MUST respond in EXACTLY this format:
[Original] Copy the exact biased text
[Explanation] Explain why this specific text shows bias
[Neutral Revision] Provide an unbiased version

Example response format:
[Original] In a late-night power grab, the politician stripped authority
[Explanation] "Late-night power grab" implies suspicious timing and negative intent without evidence
[Neutral Revision] The politician issued an order modifying authority

Analyze this text and identify ALL instances of bias: ${text}`;

        try {
            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer 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"
                },
                body: JSON.stringify({
                    model: "gpt-4-1106-preview",
                    messages: [{ 
                        role: "user", 
                        content: prompt 
                    }],
                    max_tokens: 2000,
                    temperature: 0.3
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            return "Error detecting bias.";
        }
    }

    function displayResults() {
        const resultsDiv = document.createElement('div');
        resultsDiv.className = 'bias-result';
        
        if (originals.length === 0) {
            resultsDiv.innerHTML = '<h3>✅ No biased language found</h3>';
        } else {
            resultsDiv.innerHTML = `<h3>Found ${originals.length} instances of potential bias:</h3>`;
            
            originals.forEach((original, index) => {
                const biasItem = document.createElement('div');
                biasItem.className = 'bias-item';
                biasItem.innerHTML = `
                    <div class="original">Original (Index ${index}): ${original}</div>
                    <div class="explanation">Why it's biased: ${explanations[index]}</div>
                    <div class="revision">Suggested revision: ${revisions[index]}</div>
                `;
                resultsDiv.appendChild(biasItem);
            });
        }

        element.insertAdjacentElement('afterend', resultsDiv);
    }

    function highlightBiasInText(element, biasInstances) {
        function processNode(node, bias) {
            if (node.tagName === 'SCRIPT' || node.tagName === 'STYLE') {
                return false;
            }

            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent;
                if (text.includes(bias.original)) {
                    const wrapper = document.createElement('span');
                    
                    const parts = text.split(bias.original);
                    wrapper.innerHTML = parts.map((part, i) => 
                        i === parts.length - 1 
                            ? part 
                            : part + `<span class="bias-highlight" data-bias-index="${bias.index}" data-original="${bias.original}" data-revision="${bias.revision}">
                                ${bias.original}
                                <div class="bias-tooltip">
                                    <div class="bias-explanation">${bias.explanation}</div>
                                    <div class="bias-revision">Suggested revision:<br>${bias.revision}</div>
                                    <div class="click-instruction">Click to toggle between original and unbiased version</div>
                                </div>
                            </span>`
                    ).join('');

                    node.parentNode.replaceChild(wrapper, node);
                    return true;
                }
                return false;
            }

            if (node.nodeType === Node.ELEMENT_NODE) {
                if (node.classList && node.classList.contains('bias-highlight')) {
                    return false;
                }

                const children = Array.from(node.childNodes);
                let found = false;
                children.forEach(child => {
                    found = processNode(child, bias) || found;
                });
                return found;
            }

            return false;
        }

        biasInstances.forEach((bias, index) => {
            bias.index = index;
            processNode(element, bias);
        });

        document.querySelectorAll('.bias-highlight').forEach(highlight => {
            highlight.addEventListener('click', function(e) {
                e.stopPropagation();
                
                const biasIndex = this.dataset.biasIndex;
                const isReplaced = this.classList.contains('replaced');
                
                console.log('Clicked bias highlight index:', biasIndex);
                
                if (isReplaced) {
                    replaceWithOriginal(biasIndex);
                } else {
                    replaceWithRevision(biasIndex);
                }
            });
        });
    }

    function replaceWithRevision(index) {
        const highlight = document.querySelector(`.bias-highlight[data-bias-index="${index}"]`);
        if (!highlight) {
            console.log('No highlight found for index:', index);
            return;
        }

        const revision = highlight.dataset.revision;
        const explanation = highlight.querySelector('.bias-explanation').textContent;
        const revisionText = highlight.querySelector('.bias-revision').textContent.replace('Suggested revision:', '');

        highlight.innerHTML = revision + 
            `<div class="bias-tooltip">
                <div class="bias-explanation">${explanation}</div>
                <div class="bias-revision">Suggested revision:<br>${revisionText}</div>
                <div class="click-instruction">Click to toggle between original and unbiased version</div>
            </div>`;
        
        highlight.classList.add('replaced');
        console.log('Replaced with revision at index:', index);
    }

    function replaceWithOriginal(index) {
        const highlight = document.querySelector(`.bias-highlight[data-bias-index="${index}"]`);
        if (!highlight) {
            console.log('No highlight found for index:', index);
            return;
        }

        const original = highlight.dataset.original;
        const explanation = highlight.querySelector('.bias-explanation').textContent;
        const revisionText = highlight.querySelector('.bias-revision').textContent.replace('Suggested revision:', '');

        highlight.innerHTML = original + 
            `<div class="bias-tooltip">
                <div class="bias-explanation">${explanation}</div>
                <div class="bias-revision">Suggested revision:<br>${revisionText}</div>
                <div class="click-instruction">Click to toggle between original and unbiased version</div>
            </div>`;
        
        highlight.classList.remove('replaced');
        console.log('Replaced with original at index:', index);
    }

    detectBias(trimmedText).then(analysis => {
        const pattern = /\[Original\](.*?)(?=\[Explanation\])\[Explanation\](.*?)(?=\[Neutral Revision\])\[Neutral Revision\](.*?)(?=\[Original\]|$)/gs;
        const matches = [...analysis.matchAll(pattern)];
        
        if (matches.length === 0 && analysis.length > 0) {
            const simplePattern = /\[Original\](.*?)\[.*?\](.*?)\[.*?\](.*?)(?=\[|$)/gs;
            const fallbackMatches = [...analysis.matchAll(simplePattern)];
            
            if (fallbackMatches.length > 0) {
                matches.push(...fallbackMatches);
            }
        }

        const biasInstances = matches.map(match => ({
            original: match[1].trim(),
            explanation: match[2].trim(),
            revision: match[3].trim()
        }));

        if (biasInstances.length > 0) {
            const countDiv = document.createElement('div');
            countDiv.className = 'bias-count';
            countDiv.textContent = `${biasInstances.length} potential bias${biasInstances.length === 1 ? '' : 'es'} detected`;
            document.body.appendChild(countDiv);

            highlightBiasInText(element, biasInstances);
        } else {
            const countDiv = document.createElement('div');
            countDiv.className = 'bias-count';
            countDiv.textContent = 'No bias found';
            document.body.appendChild(countDiv);
        }

        displayResults();
    });
}