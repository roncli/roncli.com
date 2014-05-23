// Require the captchagen object.
var captchagen = require("captchagen");

// Update captchagen middlewear.
captchagen.getColors = function(count, min, max) {
    "use strict";

    var colors = [],
        i, color;
    for (i = 0; i < count; i++) {
        color = {
            r: Math.floor(Math.random() * (1 + max - min)) + min,
            g: Math.floor(Math.random() * (1 + max - min)) + min,
            b: Math.floor(Math.random() * (1 + max - min)) + min
        };
        color.css = "rgb(" + color.r + "," + color.g + "," + color.b + ")";
        colors.push(color);
    }
    return colors;
};

captchagen.drawBackground = function(canvas, opt) {
    "use strict";

    var ctx = canvas.getContext("2d"),
        colors = captchagen.getColors(2, 0, 127),
        gradient = ctx.createLinearGradient(0, 0, opt.width, 0);

    gradient.addColorStop(0, colors[0].css);
    gradient.addColorStop(1, colors[1].css);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, opt.width, opt.height);
    return canvas;
};

captchagen.drawLines = function(canvas, opt) {
    "use strict";

    var ctx = canvas.getContext("2d"),
        colors = captchagen.getColors(Math.floor(Math.random() * 4) + 1, 0, 128);

    colors.forEach(function(color)
    {
        ctx.beginPath();
        ctx.moveTo(Math.floor(Math.random() * opt.width), Math.floor(Math.random() * opt.height));
        ctx.bezierCurveTo(Math.floor(Math.random() * opt.height), Math.floor(Math.random() * opt.height), Math.floor(Math.random() * opt.width), Math.floor(Math.random() * opt.height), Math.floor(Math.random() * opt.width), Math.floor(Math.random() * opt.height));

        ctx.fillStyle = ctx.strokeStyle = color.css;
        ctx.lineWidth = captchagen.getColors(Math.floor(Math.random() * 4) + 2);
        return ctx.stroke();
    });
    return canvas;
};

captchagen.drawText = function(canvas, opt) {
    "use strict";

    var ctx = canvas.getContext("2d"),
        colors = captchagen.getColors(opt.text.length, 128, 255),
        x = 25;

    opt.text.split("").forEach(function(letter, idx) {
        var color = colors[idx], size = captchagen.getFontSize(opt.height, opt.width, opt.font),
            te, y, rot;

        ctx.font = size + "px " + opt.font;
        ctx.textBaseline = "top";
        te = ctx.measureText(letter);
        y = 10;

        // set color
        ctx.fillStyle = color.css;

        // set font rotation
        rot = (Math.random() * -0.2) + 0.1;
        ctx.rotate(rot);

        // draw text
        ctx.fillText(letter, x, y);

        // unset rotation for next letter
        ctx.rotate(-rot);

        // space the x-axis for the next letter
        x += te.width + 1;
    });
    return canvas;
};

module.exports = function(req) {
    "use strict";

    var chars = "2345679ACDEFGHJKLMNPQRTUVWXY",
        text = "",
        count, captcha;

    for (count = 0; count < 8; count++) {
        text += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    captcha = new captchagen.Captcha({
        width: 180,
        height: 50,
        text: text
    });

    captcha.use(captchagen.drawBackground);
    captcha.use(captchagen.drawLines);
    captcha.use(captchagen.drawText);
    captcha.use(captchagen.drawLines);

    captcha.generate();

    return captcha;
};
