function hexToRgb(color) {
    let hex = color[0] === "#" ? color.slice(1) : color;
    let c;

    if (hex.length !== 6) {
        hex = (() => {
            const result = [];
            for (let i = 0; i < Array.from(hex).length; i++) {
                c = Array.from(hex)[i];
                result.push(`${c}${c}`);
            }
            return result;
        })().join("");
    }

    const colorStr = hex.match(/#?(.{2})(.{2})(.{2})/).slice(1);
    const rgb = colorStr.map((col) => parseInt(col, 16));
    rgb.push(1);
    return rgb;
}

function rgbToHsl(rgb) {
    const r = rgb[0] / 255;
    const g = rgb[1] / 255;
    const b = rgb[2] / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    const add = max + min;

    const hue = min === max ? 
        0 : 
        r === max ? 
            (60 * (g - b) / diff + 360) % 360 : 
        g === max ? 
            60 * (b - r) / diff + 120 : 
            60 * (r - g) / diff + 240;

    const lum = 0.5 * add;
    const sat = lum === 0 ? 
        0 : 
        lum === 1 ? 
            1 : 
        lum <= 0.5 ? 
            diff / add : 
            diff / (2 - add);

    return [
        Math.round(hue),
        Math.round(sat * 100),
        Math.round(lum * 100),
        rgb[3] || 1,
    ];
}

function hexToHsl(color) {
    const rgb = hexToRgb(color);
    const hsl = rgbToHsl(rgb);
    return `hsl(${hsl[0]}deg ${hsl[1]}% ${hsl[2]}%)`;
}

function hslToHex(h, s, l) {
    l /= 100;
    const a = (s * Math.min(l, 1 - l)) / 100;

    const f = (n) => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return (
            Math.round(255 * Math.max(0, Math.min(color, 1)))
                .toString(16)
                .padStart(2, "0")
        );
    };

    return `#${f(0)}${f(8)}${f(4)}`;
}

function hsl2rgb(h, s, l) {
    const a = s * Math.min(l, 1 - l);

    const f = (n) => {
        return l - a * Math.max(Math.min(n - 3, 9 - n, 1), -1);
    };

    return [f(0), f(8), f(4)];
}

function invertColor(hex) {
    if (hex.startsWith("#")) {
        hex = hex.slice(1);
    }

    if (hex.length === 3) {
        hex = hex.split("").map((c) => c + c).join("");
    }

    if (hex.length !== 6) {
        throw new Error("Invalid HEX color.");
    }

    const r = (255 - parseInt(hex.slice(0, 2), 16)).toString(16);
    const g = (255 - parseInt(hex.slice(2, 4), 16)).toString(16);
    const b = (255 - parseInt(hex.slice(4, 6), 16)).toString(16);

    return `#${padZero(r)}${padZero(g)}${padZero(b)}`;
}

function padZero(str, len = 2) {
    const zeros = new Array(len).join("0");
    return (zeros + str).slice(-len);
}

function getValsWrappedIn(str, c1, c2) {
    const rg = new RegExp(`(?<=\\${c1})(.*?)(?=\\${c2})`, "g");
    return str.match(rg);
}

const styleobj = {};
const hslobj = {};
let isColorsInv;

const toHSLArray = (hslStr) =>
    hslStr.match(/\d+/g).map(Number);

function offsetColorsHSV(ohsl) {
    let inner_styles = "";

    for (const key in styleobj) {
        let keyVal = styleobj[key];

        if (keyVal.includes("#") || keyVal.includes("hsl")) {
            const colcomp = document.body.querySelector(`#${key} input`);

            if (colcomp) {
                let hsl;

                if (keyVal.includes("#")) {
                    keyVal = keyVal.replace(/\s+/g, "");

                    if (isColorsInv) {
                        keyVal = invertColor(keyVal);
                        styleobj[key] = keyVal;
                    }

                    hsl = rgbToHsl(hexToRgb(keyVal));
                } else {
                    if (isColorsInv) {
                        const c = toHSLArray(keyVal);
                        const _hex = hslToHex(c[0], c[1], c[2]);
                        styleobj[key] = invertColor(_hex);
                        hsl = rgbToHsl(hexToRgb(styleobj[key]));
                    } else {
                        hsl = toHSLArray(keyVal);
                    }
                }

                const h = (parseInt(hsl[0]) + parseInt(ohsl[0])) % 360;
                const s = Math.min(Math.max(parseInt(hsl[1]) + parseInt(ohsl[1]), 0), 100);
                const l = Math.min(Math.max(parseInt(hsl[2]) + parseInt(ohsl[2]), 0), 100);

                const hex = hslToHex(h, s, l);
                colcomp.value = hex;
                hslobj[key] = `hsl(${h}deg ${s}% ${l}%)`;
                inner_styles += `${key}:${hslobj[key]};`;
            }
        } else {
            inner_styles += `${key}:${styleobj[key]};`;
        }
    }

    isColorsInv = false;
    const preview_styles = document.body.querySelector("#preview-styles");
    preview_styles.innerHTML = `:root {${inner_styles}}`;
    preview_styles.innerHTML += `@media only screen and (max-width: 860px) { :root { --ae-outside-gap-size: var(--ae-mobile-outside-gap-size); --ae-inside-padding-size: var(--ae-mobile-inside-padding-size); } }`;

    const vars_textarea = document.body.querySelector("#theme_vars textarea");
    vars_textarea.value = inner_styles;
    window.updateInput(vars_textarea);
}

function updateTheme(vars) {
    let inner_styles = "";

    for (let i = 0; i < vars.length - 1; i++) {
        const [id, val] = vars[i].split(":").map((v) => v.trim());
        styleobj[id.replace(/\s+/g, "")] = val;
        inner_styles += `${id}:${val};`;
        const elem = document.body.querySelectorAll(`#${id} input`);
        elem.forEach((el) => {
            if (val.includes("hsl")) {
                const hsl = toHSLArray(val);
                el.value = hslToHex(hsl[0], hsl[1], hsl[2]);
            } else {
                el.value = val.split("px")[0];
            }
        });
    }

    const preview_styles = document.body.querySelector("#preview-styles");

    if (preview_styles) {
        preview_styles.innerHTML = `:root {${inner_styles}}`;
        preview_styles.innerHTML += `@media only screen and (max-width: 860px) { :root { --ae-outside-gap-size: var(--ae-mobile-outside-gap-size); --ae-inside-padding-size: var(--ae-mobile-inside-padding-size); } }`;
    } else {
        const style = document.createElement("style");
        style.id = "preview-styles";
        style.innerHTML = `:root {${inner_styles}}`;
        style.innerHTML += `@media only screen and (max-width: 860px) { :root { --ae-outside-gap-size: var(--ae-mobile-outside-gap-size); --ae-inside-padding-size: var(--ae-mobile-inside-padding-size); } }`;
        document.body.appendChild(style);
    }

    const vars_textarea = document.body.querySelector("#theme_vars textarea");
    const css_textarea = document.body.querySelector("#theme_css textarea");
    vars_textarea.value = inner_styles;
    window.updateInput(vars_textarea);
    window.updateInput(css_textarea);
}

function applyTheme() {
    console.log("apply");
}

function initTheme(styles) {
    const css_styles = styles.split("/*BREAKPOINT_CSS_CONTENT*/");
    let init_css_vars = css_styles[0].split("}")[0].split("{")[1].replace(/\n|\r/g, "");
    const init_vars = init_css_vars.split(";");

    const vars_textarea = document.body.querySelector("#theme_vars textarea");
    const css_textarea = document.body.querySelector("#theme_css textarea");
    vars_textarea.value = init_css_vars;
    const additional_styles = css_styles[1] !== undefined ? css_styles[1] : "";
    css_textarea.value = `/*BREAKPOINT_CSS_CONTENT*/${additional_styles}/*BREAKPOINT_CSS_CONTENT*/`;
    updateTheme(init_vars);

    const preview_styles = document.body.querySelector("#preview-styles");
    if (!preview_styles) {
        const style = document.createElement("style");
        style.id = "preview-styles";
        style.innerHTML = styles;
        document.body.appendChild(style);
    }

    let intervalChange;
    document.body
        .querySelectorAll("#ui_theme_settings input")
        .forEach((elem) => {
            elem.addEventListener("input", (e) => {
                let val = e.currentTarget.value;
                if (e.currentTarget.type === "range" || e.currentTarget.type === "number") {
                    val += "px";
                }
                if (e.currentTarget.type === "color") {
                    val = e.currentTarget.value;
                }

                styleobj[e.currentTarget.parentElement.id] = val;

                if (intervalChange != null) clearInterval(intervalChange);
                intervalChange = setTimeout(() => {
                    let inner_styles = "";
                    for (const key in styleobj) {
                        inner_styles += `${key}:${styleobj[key]};`;
                    }

                    vars_textarea.value = inner_styles;
                    preview_styles.innerHTML = `:root {${inner_styles}}`;
                    preview_styles.innerHTML += `@media only screen and (max-width: 860px) { :root { --ae-outside-gap-size: var(--ae-mobile-outside-gap-size); --ae-inside-padding-size: var(--ae-mobile-inside-padding-size); } }`;

                    window.updateInput(vars_textarea);
                    offsetColorsHSV(hsloffset);
                }, 1000);
            });
        });

    const reset_btn = document.getElementById("theme_reset_btn");
    reset_btn.addEventListener("click", (e) => {
        e.preventDefault();
        document.body
            .querySelectorAll("#ui_theme_hsv input")
            .forEach((elem) => {
                elem.value = 0;
            });
        hsloffset = [0, 0, 0];
        updateTheme(init_vars);
    });

    let intervalCheck;

    function dropDownOnChange() {
        if (init_css_vars !== vars_textarea.value) {
            clearInterval(intervalCheck);
            init_css_vars = vars_textarea.value.replace(/\n|\r/g, "");
            vars_textarea.value = init_css_vars;
            const vars = init_css_vars.split(";");
            updateTheme(vars);
        }
    }

    const drop_down = document.body.querySelector("#themes_drop_down input");
    drop_down.addEventListener("click", (e) => {
        if (intervalCheck !== null) clearInterval(intervalCheck);
        vars_textarea.value = init_css_vars;
        intervalCheck = setInterval(dropDownOnChange, 500);
    });

    let hsloffset = [0, 0, 0];

    document.body
        .querySelectorAll("#theme_hue input")
        .forEach((elem) => {
            elem.addEventListener("change", (e) => {
                e.preventDefault();
                hsloffset[0] = e.currentTarget.value;
                offsetColorsHSV(hsloffset);
            });
        });

    document.body
        .querySelectorAll("#theme_sat input")
        .forEach((elem) => {
            elem.addEventListener("change", (e) => {
                e.preventDefault();
                hsloffset[1] = e.currentTarget.value;
                offsetColorsHSV(hsloffset);
            });
        });

    document.body
        .querySelectorAll("#theme_brt input")
        .forEach((elem) => {
            elem.addEventListener("change", (e) => {
                e.preventDefault();
                hsloffset[2] = e.currentTarget.value;
                offsetColorsHSV(hsloffset);
            });
        });

    const inv_btn = document.getElementById("theme_invert_btn");
    inv_btn.addEventListener("click", (e) => {
        e.preventDefault();
        isColorsInv = !isColorsInv;
        offsetColorsHSV(hsloffset);
    });
}

function observeGradioApp() {
    const observer = new MutationObserver(() => {
        const css = document.querySelector('[rel="stylesheet"][href*="user"]');
        const block = gradioApp().getElementById("tab_ui_theme");

        if (css && block) {
            observer.disconnect();
            setTimeout(() => {
                const rootRules = Array.from(css.sheet.cssRules).filter((cssRule) => {
                    return cssRule instanceof CSSStyleRule && cssRule.selectorText === ":root";
                });
                const rootCssText = rootRules[0].cssText;
                initTheme(rootCssText);
            }, 500);
        }
    });

    observer.observe(gradioApp(), {
        childList: true,
        subtree: true,
    });
}

document.addEventListener("DOMContentLoaded", observeGradioApp);

