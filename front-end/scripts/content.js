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
  const shadow = infoBg.attachShadow({ mode: 'open' });

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

            transition: max-width 0.1s ease-in, opacity 0.1s ease-in;
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
            font-weight: 500;

            color: #dcdddf;
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
            font-weight: 500;

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
            max-height: 500px;
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
    </style>
<div class="box-header" id="box-header">
    <div class="text-container">
        <div class="total-bias-text">10000 biased passages</div>
        <div class="total-bias-subtext">select a highlighted passage</div>
    </div><button>fix all </button>
</div>
<div class="small-header" id="small-header"> 
  <div class="total-bias-text">10</div>
</div>
<div class="box-text" id="box-text">
    <div class="passage">
        <p class="original-passage">
            These are, when I looked at those showrooms burning and those cars — not one or two, like seven,
            eight, ten, burning, exploding all over the place — these are terrorists.
        </p>
        <div class="vertical-gap">
        </div>
        <p class="fixed-passage">
            When I saw the damage to the showrooms and vehicles — several of them burned — I believe these acts
            should be treated seriously and potentially as criminal extremism.
        </p>

    </div>
    <p class="explanation">
        Trump’s repetition and exaggeration (“exploding all over the place”) combined with labeling (“these are
        terrorists”) uses emotionally evocative language to heighten fear and outrage. It paints a vivid and
        potentially exaggerated image to stir emotion.
    </p>

    <button class="fix-button">
        replace passage
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
      element.style.maxWidth = "65px";
      boxHeader.style.opacity = "0";
      smallHeader.style.opacity = "1";
    }
    


  }
  function growBox() {
    element.style.maxWidth = "350px";
    boxHeader.style.opacity = "1";
    smallHeader.style.opacity = "0";

  }

  setTimeout(growBox, 1000); // 5000 milliseconds = 5 seconds
  setTimeout(shrinkBox, 2500); // 5000 milliseconds = 5 seconds


  element = document.getElementById('infoContainer');
  const boxHeader = shadow.getElementById("box-header");
  const smallHeader = shadow.getElementById("small-header");
  element.addEventListener('mouseover', () => {
    growBox();

  });


  element.addEventListener('mouseout', () => {
    shrinkBox();
  });

  //animate.
  document.addEventListener("keydown", function (event) {
    if (event.code === "Space" || event.key === " " || event.keyCode === 32) {
      event.preventDefault(); // Optional: prevents page from scrolling
      isSelected = !isSelected;
      updateBox();
    }
  });

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
      }, 100);

    }
  }




  /** WORD COUNT AND READING TIME BADGE
   * 
    const wordMatchRegExp = /[^\s]+/g;
    const words = text.matchAll(wordMatchRegExp);
  
    const wordCount = [...words].length;
    const readingTime = Math.round(wordCount / 200);
    const badge = document.createElement('p');
  
    badge.classList.add('color-secondary-text', 'type--caption');
    badge.textContent = `⏱️ ${readingTime} min read`;
    
  
    // Support for API reference docs
    const heading = article.querySelector('h1');
    // Support for article docs with date
    const date = article.querySelector('time')?.parentNode;
  
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/insertAdjacentElement
    (date ?? heading).insertAdjacentElement('afterend', badge);
    */
}
