const status = document.getElementById("status");
const statusText = document.getElementById("status-text");
const input = document.getElementById("word-input");
const result = document.getElementById("result");
const runBtn = document.getElementById("run-btn");
const randomBtn = document.getElementById("random-btn");
const log = document.getElementById("log");
const logList = document.getElementById("log-list");

const WORDS = {
  boring: "tedious",
  tired: "exhausted",
  small: "tiny",
  fast: "swift",
  hungry: "starving",
  quiet: "silent",
  strange: "peculiar",
  bright: "brilliant",
  heavy: "massive",
  old: "ancient",
  clean: "spotless",
  sad: "miserable",
  brave: "courageous",
  weak: "feeble",
  busy: "hectic",
  slow: "sluggish",
  angry: "furious",
  cold: "freezing",
  hot: "scorching",
  happy: "ecstatic",
  afraid: "terrified",
  big: "enormous",
  beautiful: "gorgeous",
  ugly: "hideous",
};

const history = [];

function cleanWord(word) {
  return (word || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z-]/g, "");
}

function setStatus(mode, message) {
  status.className = `status ${mode}`;
  statusText.textContent = message;
}

async function getSuggestion(word) {
  if (WORDS[word]) return WORDS[word];

  const res = await fetch(
    `https://api.datamuse.com/words?ml=${encodeURIComponent(word)}&max=20`,
  );

  if (!res.ok) throw new Error(`Datamuse error: ${response.status}`);

  const words = await res.json();
  console.log(words);
  const match = words.find((item) =>{
    const value = cleanWord(item.word);
    return(
      value&&
      value!==word&&
      !item.word.includes(" ")&&
      /^[a-z-]+$/i.test(item.word)
    )
  });

  return match? cleanWord(match.word):null;
}

async function combineWord(word) {
  if (!word) return;

  result.textContent = "...";
  result.className = "result thinking";
  runBtn.disabled = randomBtn.disabled = true;
  setStatus("loading", "Looking it up");

  try {
    const suggestion = await getSuggestion(word);
    if(suggestion){
      result.textContent = suggestion;
      result.className = "result filled"
      setStatus("ready", "Ready");

      history.unshift([word,suggestion]);
      log.hidden = false;
      logList.innerHTML = history
        .slice(0,6)
        .map(
          ([word,suggestion]) =>
            `<li><span>very ${word}</span><span>${suggestion}</span></li>`
        ).join("")
    }else{
      result.textContent ="(no close match)";
      result.className="result";
      setStatus("ready","try another word")
    }
  } catch (error) {
    result.textContent="error";
    result.className="result";
    setStatus("loading",
      "Request failed - check you internet connection"
    )
  }finally{
    runBtn.disabled=randomBtn.disabled=false;
  }
}

randomBtn.addEventListener("click",()=>{
  const words = Object.keys(WORDS);
  const word = words[Math.floor(Math.random()*words.length)];
  input.value = word;
  combineWord(word);
})
runBtn.addEventListener("click", () => {
  const word = cleanWord(input.value);
  if (word) combineWord(word);
});
input.addEventListener("keydown", (e) => {
  if (e.key == "Enter") runBtn.click();
});

