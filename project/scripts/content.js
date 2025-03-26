// Copyright 2022 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

var selectedIndex = 0;
var totalNumOfBiases = 0;
let shadow = null; // declare it globally


var originals = [];
var explanations = [];
var revisions = [];

const link1 = document.createElement('link');
link1.rel = 'preconnect';
link1.href = 'https://fonts.googleapis.com';
document.head.appendChild(link1);

const link2 = document.createElement('link');
link2.rel = 'preconnect';
link2.href = 'https://fonts.gstatic.com';
link2.crossOrigin = 'anonymous';
document.head.appendChild(link2);

const link3 = document.createElement('link');
link3.rel = 'stylesheet';
link3.href = 'https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap';
document.head.appendChild(link3);

link3.onload = () => {
  document.body.style.fontFamily = "'Poppins', sans-serif";
};


const article = document.querySelector('article');
const main = document.querySelector('main');

// `document.querySelector` may return null if the selector doesn't match anything.
if (article || main) {
  if (article) {
    const text = article.textContent;
  } else {
    const text = main.textContent;
  }

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.type = 'text/css';
  link.href = chrome.runtime.getURL('styles.css');
  document.head.appendChild(link);

  // // Create and inject the div
  // const testDiv = document.createElement('div');
  // testDiv.id = 'info-container';
  // testDiv.classList.add('info-container');
  // testDiv.textContent = 'hello world';
  // document.body.appendChild(testDiv);


  // Create the main container
  const stepsContainer = document.createElement("div");
  stepsContainer.className = "info-container";
  stepsContainer.id = "infoContainer";

  // Create the "step-bg" div
  const infoBg = document.createElement("div");
  shadow = infoBg.attachShadow({ mode: 'open' });

  document.body.appendChild(infoBg);

  shadow.innerHTML = `
      <style>
        * {
            font-family: 'Poppins', sans-serif;
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            letter-spacing: 0.5px;
            color: #ffffff;
        }

        .box-header {
            box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
            position: relative;
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            height: 65px;
            background-color: rgba(26, 20, 45, 0.187);
            opacity: 0;

            border-radius: 32.5px 32.5px 0 0;
            padding: 20px;

            transition: max-width 0.1s ease-in, opacity 0.1s ease-in, border-radius 0.1s ease-in;
        }



        .text-container {
            display: flex;
            flex-direction: column;
            justify-content: center;
            line-height: 0;
            gap: 18px;
        }

        .total-bias-text {
            font-size: 14px;
            font-weight: 500;
            color: #ffffff;
        }

        .total-bias-subtext {
            font-size: 10px;
            font-weight: 600;

            color:rgba(226, 236, 255, 0.73);
        }

        button {
            position: absolute;
            right: calc((65px - 40px)/2);
            height: 40px;
            width: 120px;
            background-color: rgba(128, 70, 128, 0.584);
            box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.119), inset 1px 1px 1px rgba(255, 255, 255, 0.208);

            color: #fff;
            border: none;
            border-radius: 20px;
            cursor: pointer;
        }

        button:hover {
            background-color: rgba(86, 48, 86, 0.584);
        }


        .passage {
            display: flex;
            position: relative;
            width: 100%;
            gap: 30px;
            font-size: 14px;
        }

        .original-passage {
            width: 50%;
            font-style: italic;
        }

        .fixed-passage {
            width: 50%;
            font-weight: 600;

        }

        .vertical-gap {
            position: absolute;
            top: 0;
            bottom: 0;
            left: 50%;
            width: 2.5px;
            background-color: rgba(56, 31, 56, 0.432);
            border-radius: 1.25px;
        }

        .explanation {
            font-size: 12px;
            margin-bottom: 40px;
        }

        .box-text {
            display: none;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            width: 100%;
            gap: 10px;
          
            border-radius: 32.5px;
            padding: 20px;
            position: relative;
            max-height: 0px;

            transition: max-height 0.1s ease-in;

            overflow: hidden;
        }

        .small-header {
            display: flex;
            justify-content: center;
            align-items: center;
            position: absolute;
            opacity: 1;


            height: 40px;
            width: 40px;
            background-color: rgba(128, 70, 128, 0.584);
            box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.119), inset 1px 1px 1px rgba(255, 255, 255, 0.208);

            color: #fff;
            border: none;
            border-radius: 20px;
            cursor: pointer;
        }
        
        .box-text.expanded {
            max-height: 800px;
        }

        .fix-button {
            position: absolute;
            bottom: 10px;
            height: 40px;
            width: calc( 100% - ((65px - 40px)));

            color: #fff;
            border: none;
            border-radius: 20px;
            cursor: pointer;
        }
            @keyframes dotLoader {
  0% { content: "|·· l"; }
  33% { content: "|· ·l"; }
  66% { content: "|··l "; }
}

@keyframes dotsFade {
  0% { content: "Loading."; }
  33% { content: "Loading.."; }
  66% { content: "Loading..."; }
}

@keyframes fadeUpOut {
  0% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(-10px);
  }
}

@keyframes fadeUpIn {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.loading-anim::after {
  content: "|·· l";
  animation: dotLoader 1.2s steps(3) infinite;
  white-space: pre;
  font-family: monospace;
}

.loading-dots::after {
  content: "Loading.";
  animation: dotsFade 1.5s steps(3) infinite;
}

.fade-text {
  position: relative;
  display: inline-block;
  animation: fadeUpIn 0.5s ease-out forwards;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.fade-text {
  position: relative;
  display: inline-block;
  animation: fadeUpIn 0.5s ease-out forwards;
  color: rgba(226, 236, 255, 0.73); /* Match the subtext color */
  font-size: 10px;
  font-weight: 600;
}

    </style>
<div class="box-header" id="box-header">
    <div class="text-container">
        <div class="total-bias-text loading-dots" id="loadingText"></div>
        <div class="total-bias-subtext">ANALYZING PAGE</div>
    </div><button id="fixAll">Fix All </button>
</div>
<div class="small-header" id="small-header"> 
  <div class="total-bias-text">···</div>
</div>
<div class="box-text" id="box-text">
    <div class="passage">
        <p class="original-passage">

        </p>
        <div class="vertical-gap">
        </div>
        <p class="fixed-passage">

        </p>

    </div>
    <p class="explanation">
        Trump’s repetition and exaggeration (“exploding all over the place”) combined with labeling (“these are
        terrorists”) uses emotionally evocative language to heighten fear and outrage. It paints a vivid and
        potentially exaggerated image to stir emotion.
    </p>

    <button class="fix-button">
        Replace Passage
    </button>
</div>
`;

  infoBg.className = "info-bg";


  // Create the three circle divs
  const blueCircle = document.createElement("div");
  blueCircle.className = "BlueCircle";

  const redCircle = document.createElement("div");
  redCircle.className = "RedCircle";

  const purpleCircle = document.createElement("div");
  purpleCircle.className = "PurpleCircle";

  // Append all the elements to the container
  stepsContainer.appendChild(infoBg);
  stepsContainer.appendChild(blueCircle);
  stepsContainer.appendChild(redCircle);
  stepsContainer.appendChild(purpleCircle);

  // Append the container to the bottom of the body
  document.body.appendChild(stepsContainer);

  //box mode?
  var isSelected = false;
  updateBox();

  var isHoverin = false;

  function shrinkBox() {
    if (!isSelected) {
      infoContainer.style.maxWidth = "65px";
      boxHeader.style.opacity = "0";
      smallHeader.style.opacity = "1";
    }



  }
  function growBox() {
    infoContainer.style.maxWidth = "350px";
    boxHeader.style.opacity = "1";
    smallHeader.style.opacity = "0";

  }

  setTimeout(growBox, 1000); // 5000 milliseconds = 5 seconds


  infoContainer = document.getElementById('infoContainer');
  const boxHeader = shadow.getElementById("box-header");
  const smallHeader = shadow.getElementById("small-header");
  infoContainer.addEventListener('mouseover', () => {
    growBox();

  });


  infoContainer.addEventListener('mouseout', () => {
    shrinkBox();
  });

  //animate.
  // document.addEventListener("keydown", function (event) {
  //   if (event.code === "Space" || event.key === " " || event.keyCode === 32) {
  //     event.preventDefault(); // Optional: prevents page from scrolling
  //     isSelected = !isSelected;
  //     updateBox();
  //   }
  // });

  function maybeShrinkBox() {
    const oneHour = 1000;
    const startTime = performance.timing.navigationStart;
    const currentTime = Date.now();

    if (currentTime - startTime >= oneHour) {
      shrinkBox();
    }
  }


  function updateBox() {
    const boxText = shadow.getElementById("box-text");
    const boxHeader = shadow.getElementById("box-header");

    const blueCircle = document.querySelector(".BlueCircle");
    const redCircle = document.querySelector(".RedCircle");
    const purpleCircle = document.querySelector(".PurpleCircle");

    if (isSelected) {
      boxText.style.display = "flex";
      boxHeader.style.borderRadius = "32.5px 32.5px 0 0";

      blueCircle.style.display = "block";
      redCircle.style.display = "block";
      purpleCircle.style.display = "block";

      requestAnimationFrame(() => {
        boxText.classList.add('expanded');
      });

      growBox();

    } else {
      boxText.classList.remove('expanded');
      boxHeader.style.borderRadius = "32.5px";
      blueCircle.style.display = "none";
      redCircle.style.display = "none";
      purpleCircle.style.display = "none";

      setTimeout(() => {
        boxText.style.display = "none";
        maybeShrinkBox();
      }, 100);

    }
  }





}





// HIGHLIGHT BIAS DETECTION CODE
// SEPERATE CODE!!!!!!!!!


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
    background-color:rgba(149, 0, 255, 0.14);
    cursor: pointer;
    position: relative;
    display: inline;
    transition: background-color 0.3s;
  }

  .bias-highlight:hover {
    background-color:rgba(183, 0, 255, 0.28);
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

  .bias-highlight.selected {
  background-color:rgba(157, 0, 255, 0.28); !important;
}


  .bias-explanation {
    color: #d32f2f;
    margin-bottom: 8px;
    display: none;
  }

  .bias-revision {
    color: #2e7d32;
    border-top: 1px solid #eee;
    padding-top: 8px;
    margin-top: 8px;
    display: none;
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

document.addEventListener('click', function (e) {
  const isHighlight = e.target.closest('.bias-highlight');

  if (!isHighlight) {
    // Deselect all highlights
    document.querySelectorAll('.bias-highlight.selected').forEach(el => {
      el.classList.remove('selected');
    });

    isSelected = false;
    updateBox();

    const subtext = shadow.getElementById("box-header")
      .querySelector(".total-bias-subtext");
    // subtext.textContent = "select a highlighted passage";
    subtext.textContent = "SELECT A HIGHLIGHTED PASSAGE";
  }
});


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
  originals = [];
  explanations = [];
  revisions = [];

  let spinnerInterval, messageInterval;

  // START animations
  function startLoadingAnimations() {
    //disable fix all button
    shadow.getElementById('fixAll').disabled = true;

    // Animate |·· l
    const smallHeaderText = shadow.getElementById("small-header").querySelector(".total-bias-text");
    let spinnerFrames = ["|·· l", "|· ·l", "|··l "];
    let spinnerIndex = 0;

    spinnerInterval = setInterval(() => {
      if (smallHeaderText) {
        smallHeaderText.textContent = spinnerFrames[spinnerIndex];
        spinnerIndex = (spinnerIndex + 1) % spinnerFrames.length;
      }
    }, 400);

    // Animate changing analyzing messages
    const subtextEl = shadow.getElementById("box-header").querySelector(".total-bias-subtext");
    const analyzingMessages = [
      "QUANTIFYING LINGUISTIC BIAS...",
      "SCANNING POLITICAL TONE...",
      "EVALUATING NEUTRALITY METRICS...",
      "ANALYZING EMOTIONAL LANGUAGE...",
      "ASSESSING EDITORIAL FRAMING..."
    ];
    let messageIndex = 0;

    messageInterval = setInterval(() => {
      if (!subtextEl) return;

      const oldEl = subtextEl.querySelector(".fade-text");
      if (oldEl) {
        oldEl.style.animation = "fadeUpOut 0.5s ease-in forwards";
        messageTimeout =setTimeout(() => {
          subtextEl.innerHTML = `<span class="fade-text">${analyzingMessages[messageIndex]}</span>`;
          messageIndex = (messageIndex + 1) % analyzingMessages.length;
        }, 500);
      } else {
        subtextEl.innerHTML = `<span class="fade-text">${analyzingMessages[messageIndex]}</span>`;
        messageIndex = (messageIndex + 1) % analyzingMessages.length;
      }
    }, 2000);
  }

  // STOP animations
  function stopLoadingAnimations() {
    //enable fix all button
    shadow.getElementById('fixAll').disabled = false;
    
    clearInterval(spinnerInterval);
    clearInterval(messageInterval);
    clearTimeout(messageTimeout);

    // Reset text
    const smallHeaderText = shadow.getElementById("small-header").querySelector(".total-bias-text");
    const subtextEl = shadow.getElementById("box-header").querySelector(".total-bias-subtext");

    if (smallHeaderText) smallHeaderText.textContent = totalNumOfBiases;
    if (subtextEl) subtextEl.innerHTML = `SELECT A HIGHLIGHTED PASSAGE`;

    const loadingText = shadow.getElementById("loadingText");
    if (loadingText) {
      loadingText.classList.remove("loading-dots");
      loadingText.textContent = `${totalNumOfBiases} Biased Passages`;
    }

  }

async function detectBias(text) {
  const prompt = `Analyze the following text for biased language and political bias. Pay special attention to:

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

For EACH instance of bias found, you MUST respond in EXACTLY this format, no quotation marks, bullet points or numbered lists:
[Original] Copy the exact biased text
[Explanation] Explain why this specific text shows bias
[Neutral Revision] Provide an unbiased version

Multiple in one sentence should be divided into separate instances, with only the EXACT PORTION of the sentence containing the bias being included in the [Original] section.

Specific word choice works best for corrections. Many short corrections are better than fewer long ones.

Also start your response with a [Reasoning] section to plan out your response. The reasoning should end with these exact words: 
"
I need to remember to not add "" (quotation marks) around any of my instances, so instead of: "far-left extremists" I should write: far left extremists
" 

Then in the reasoning write:
"
I also need to remember that if I am flagging a quote as biased, I need to include entire quote. Here is every quote in the article. If I include any of the following I need to remember to include all of it:
" 
then include a list of every quoted statement from the article

Write [Response] to start your response.

Example response format:
[Original] In a late-night power grab, the politician stripped authority
[Explanation] "Late-night power grab" implies suspicious timing and negative intent without evidence
[Neutral Revision] The politician issued an order modifying authority

INSTRUCTIONS IF YOU ARE PULLING FROM A DIRECT QUOTE IN THE ARTICLE:
If it is a direct quote, include the ENTIRE quote (including the quotation marks on the ends of it). In the [Explanation] section, include something along The use of a direct quote include why it's biased that the news website used an exact quote, rather then a more neutral paraphrase. In the revision, you should paraphrase the quote while ensuring that your revision works as a drop-in substitution. 

Except for quotes of a person (due to needing to include the whole quote), the shorter the passage the better. 4 WORDS is the ideal length.

Analyze this text and identify ALL instances of bias: ${text}`;

  console.log("Sending request to Gemini 2.0 Flash with prompt:", prompt);

  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyBJ5d7tAYDQAAUBYLLONu0j5S6xOBTtnoM", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    const result = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "No response from Gemini.";
    console.log("Raw analysis from Gemini:", result);
    return result;

  } catch (error) {
    console.error("Error from Gemini:", error);
    return "Error detecting bias.";
  }
}


  function displayResults() {
    const resultsDiv = document.createElement('div');
    resultsDiv.className = 'bias-result';

    if (originals.length === 0) {
      resultsDiv.innerHTML = '<h3>✅ No biased language found</h3>';
      resultsDiv.style.display = 'none';
    } else {
      resultsDiv.innerHTML = `<h3>Found ${originals.length} instances of potential bias:</h3>`;
      resultsDiv.style.display = 'none';

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

  function escapeHTMLAttr(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
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
          const safeOriginal = escapeHTMLAttr(bias.original);
          const safeRevision = escapeHTMLAttr(bias.revision);

          const parts = text.split(bias.original);
          wrapper.innerHTML = parts.map((part, i) =>
            i === parts.length - 1
              ? part
              : part +
              `<span class="bias-highlight" data-bias-index="${bias.index}" data-original="${safeOriginal}" data-revision="${safeRevision}">
                  ${bias.original}
                  <div class="bias-tooltip">
                    <div class="bias-explanation">${bias.explanation}</div>
                    <div class="bias-revision">Suggested revision:<br>${bias.revision}</div>
                    <div class="click-instruction">Potentally Biased — Click for Details</div>
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
      highlight.addEventListener('click', function (e) {
        e.stopPropagation();

        // Remove 'selected' from all highlights
        document.querySelectorAll('.bias-highlight.selected').forEach(el => {
          el.classList.remove('selected');
        });

        // Add 'selected' to the clicked one
        this.classList.add('selected');

        const biasIndex = this.dataset.biasIndex;
        selectedIndex = parseInt(biasIndex);
        isSelected = true;
        updateBox();
        updateBoxContent(biasIndex);

        const subtext = shadow.getElementById("box-header")
          .querySelector(".total-bias-subtext");
        subtext.textContent = `SELECTED ${parseInt(biasIndex) + 1} of ${totalNumOfBiases}`;
      });
    });

  }


  shadow.getElementById('box-text')
    .querySelector('.fix-button')
    .addEventListener('click', () => {
      replaceWithRevision(selectedIndex);

      console.log('Replaced passage in article with revised version');
    });

  // Add "Fix All" event listener
  shadow.getElementById("fixAll").addEventListener('click', () => {
    shadow.getElementById('fixAll').disabled = true;
    for (let i = 0; i < originals.length; i++) {
      replaceWithRevision(i);
    }
    console.log('Applied all revisions');
  });


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
                <div class="click-instruction">Bias Replaced — Click for Details</div>
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
                <div class="click-instruction">Potentally Biased — Click for Details</div>
            </div>`;

    highlight.classList.remove('replaced');
    console.log('Replaced with original at index:', index);
  }

  startLoadingAnimations();

  detectBias(trimmedText).then(analysis => {

    const responseStartIndex = analysis.lastIndexOf('[response]');
    if (responseStartIndex !== -1) {
      const postResponseContent = analysis.slice(responseStartIndex + '[response]'.length).trim();
      analysis = postResponseContent;
    }

    const pattern = /\[Original\](.*?)(?=\[Explanation\])\[Explanation\](.*?)(?=\[Neutral Revision\])\[Neutral Revision\](.*?)(?=\[Original\]|$)/gs;
    const matches = [...analysis.matchAll(pattern)];
    console.log("Regex matches:", matches); // 👈 ADD HERE


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
    originals = biasInstances.map(b => b.original);
    explanations = biasInstances.map(b => b.explanation);
    revisions = biasInstances.map(b => b.revision);


    if (biasInstances.length > 0) {
      const countDiv = document.createElement('div');
      countDiv.className = 'bias-count';
      countDiv.textContent = `${biasInstances.length} potential bias${biasInstances.length === 1 ? '' : 'es'} detected`;
      countDiv.style.display = 'none';

      setTimeout(shrinkBox, 2500);

      totalNumOfBiases = biasInstances.length;
      shadow.getElementById('small-header').textContent = totalNumOfBiases;

      //show total-bias-subtext
      shadow.getElementById('box-header').querySelector('.total-bias-subtext').textContent = 'SELECT A HIGHLIGHTED PASSAGE';


      shadow.getElementById('box-header').querySelector('.total-bias-text').textContent = `${totalNumOfBiases} Biased Passages
            `;
      document.body.appendChild(countDiv);

      highlightBiasInText(element, biasInstances);
    } else {
      const countDiv = document.createElement('div');
      countDiv.className = 'bias-count';
      countDiv.textContent = 'No bias found';
      countDiv.style.display = 'none';
      //show total-bias-subtext
      shadow.getElementById('box-header').querySelector('.total-bias-subtext').textContent = 'FOUND NO BIASED PASSAGES';
      shadow.getElementById('box-header').querySelector('.total-bias-text').textContent = 'no bias detected';
      document.body.appendChild(countDiv);
    }

    stopLoadingAnimations();

    displayResults();
  });
}

function updateBoxContent(index) {
  const bias = {
    original: originals[index],
    explanation: explanations[index],
    revision: revisions[index]
  };

  const boxText = shadow.getElementById('box-text');
  const originalPassage = boxText.querySelector('.original-passage');
  const fixedPassage = boxText.querySelector('.fixed-passage');
  const explanation = boxText.querySelector('.explanation');

  originalPassage.textContent = bias.original;
  fixedPassage.textContent = bias.revision;
  explanation.textContent = bias.explanation;

  console.log('Updated box content with bias:', bias);
}

