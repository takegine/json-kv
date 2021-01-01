 /* Copyright (C) 2010 by Matheus Valadares
 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:
 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.
 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 */
/**
 *    KeyValue
 *
 *    Implementation Ver. 1.3
 *
 *    @author 西索酱
 */

/*jslint browser: true, node: true, indent: 4 */

////

var encode_a, encode_o, encode_KV, GetValue, KeyValue;

function isObjectKeyword(obj) {
    'use strict';
    if ((obj.constructor === Boolean) || (obj === null) || (obj === undefined)) {
        return true;
    }
    return false;
}

function isStringKeyword(str) {
    'use strict';
    switch (str) {
    case 'true':
    case 'false':
    case 'null':
        return true;
    default:
        return false;
    }
}

function isSimple(key) {
    'use strict';

    var i = 0, ch;

    if ((key.length === 0) || (isStringKeyword(key))) {
        return false;
    }

    for (i; i < key.length; i += 1) {
        ch = key.charAt(i);
        switch (ch) {
        case ' ':
        case '\t':
        case '\n':
        case '\r':
        case '[':
        case ']':
        case '{':
        case '}':
        case '"':
        case '\'':
        case '\\':
            return false;
        }
    }

    return true;
}

function isCharSimple(ch) {
    'use strict';
    switch (ch) {
    case '':
    case ' ':
    case '\t':
    case '\n':
    case '\r':
    case '[':
    case ']':
    case '{':
    case '}':
    case '"':
    case '\'':
    case '\\':
        return false;
    }
    return true;
}

function keywordToValue(str) {
    'use strict';
    switch (str) {
    case 'true':
        return true;
    case 'false':
        return false;
    case 'null':
        return null;
    default:
        return null;
    }
}

function keywordToString(obj) {
    'use strict';
    return String(obj);
}

function isNumeric(str) {
    'use strict';
    return (/^[\-0-9.]+$/).test(str);
}

function supported(obj) {
    'use strict';
    if ((obj.constructor === String) || (obj.constructor === Number)) {
        return true;
    }
    return false;
}

function ms(str, times) {
    'use strict';
    var r = '', i = 0;
    for (i; i < times; i += 1) {
        r += str;
    }
    return r;
}

////

function encode_a(arr, depth, compact, Newline){
    'use strict';
	var str = "";
	var dp = ms('\t', compact?1:depth-1);
	for(var i = 0; i < arr.length;++i) {
        str += (i === 0 ? '' : ' ') + GetValue(arr[i], depth, compact, Newline)+Newline;
	}
	return str+Newline+dp
}

function encode_o(obj, depth, compact, Newline){
    'use strict';
	var str = "";
	var ch = "";//最后一个字符检测
	var dp = ms('\t', compact?1:depth-1);
	for(var i in obj) {
		if(obj[i].constructor == Function) continue;
		str += encode_KV(i, obj[i], depth, compact, Newline, ch);
		ch = compact? str.charAt(str.length - 1) : ch ;
	}
    return str+Newline+dp;
}

function encode_KV(key, value, depth, compact, Newline, ch){
    'use strict';
	var dp = ms('\t', compact?1:depth);
    var str =(!compact&&isCharSimple(ch))? ' ':'';
    var key1 = (compact&&isSimple(key))? key : `"${key}"`
	return str+dp+key1+' '+GetValue(value, depth, compact, Newline)+Newline
}

function GetValue(value, depth, compact, Newline){
    'use strict';
    var type = value.constructor;
    if(value === null
    || value === undefined
    || type  === Boolean )
        //isObjectKeyword
        return keywordToString(value);
    if(type === String ){
        //supported
        var tmp = String(value).replace(/"/gm, '\\"');
        if (compact&&isSimple(tmp)){
            return tmp;
        }else {
            return '"'+tmp+'"';
        }
    }
    if(type === Number ) {
        if (compact) {
            return Number(value).toString(10);
        } else {
            return value;
        }
    }
    if(type === Array)
    return `[${Newline+encode_a(value, depth+1, compact, Newline)}]`;

    return `{${Newline+encode_o(value, depth+1, compact, Newline)}}`;
}

////

function KeyValueDecoder() {
    'use strict';

    var self = this, root, depths, depth,
        inString, stringType, building, curKey;

    this.onInit = function () {
        depths = [];
        depth = 0;
        inString = false;
        stringType = 0;
        building = '';
        curKey = null;

        depths.push({});
    };

    this.onKeyValue = function (key, value) {
        depths[depth][key] = value;
    };

    this.onValue = function (value) {
        depths[depth].push(value);
    };

    this.onBlock = function (key, type) {
        depth += 1;
        switch (type) {
        case 0:
            depths.push({});
            break;
        case 1:
            depths.push([]);
            break;
        default:
            throw new Error('Unknown block type: ' + type);
        }
    };

    this.onEndBlock = function (key, type) {
        var d = (depth -= 1), obj;
        switch (KeyValue.parserGetParentType()) {
        case 0:
            obj = depths.pop();
            depths[d][key] = obj;
            break;
        case 1:
            depths[d].push(depths.pop());
            break;
        default:
            throw new Error('Unknown block type: ' + type);
        }
    };

    this.onFinish = function () {
        root = depths[0];
        self.root = root;
    };
}

KeyValueDecoder.prototype = {
    root: null
};

var KeyValue = {
    parserGetParentType: null
};

KeyValue.parse = function (code, parser) {
    'use strict';
    var i = 0, depthsKey = [], depthsType = [], depth = -1,
        inString = false, stringType = 0, building = '',
        curKey = null, keyLine = 0, lineCount = 1, tmpStr, ch;

    KeyValue.parserGetParentType = function () {
        if (depth === 0) {
            return 0;
        }
        return depthsType[depth - 1];
    };

    depthsKey.push('');
    depthsType.push(0);
    depth += 1;

    parser.onInit();

    for (i; i < code.length; i += 1) {
        ch = code.charAt(i);
        if (inString) {
            if (ch === '\\') {
                if (i === code.length - 1) {
                    throw new Error('Cannot escape nothing at line ' + lineCount);
                }
                switch (code.charAt(i + 1)) {
                case '"':
                    building += '"';
                    break;
                case "'":
                    building += "'";
                    break;
                case 'n':
                    building += '\n';
                    break;
                case 'r':
                    building += '\r';
                    break;
                default:
                    throw new Error('Invalid escape character at line ' + lineCount);
                }
                i += 1;
            } else if ((ch === '\"' && stringType === 0) || (ch === "'" && stringType === 1) || (stringType === 2 && !isCharSimple(ch))) {
                if (depthsType[depth] === 0) {
                    if (curKey === null) {
                        curKey = building;
                        keyLine = lineCount;
                    } else {
                        if (keyLine !== lineCount) {
                            throw new Error('Key must be on the same line of the value at line ' + keyLine);
                        }
                        if (stringType === 2) {
                            if (isNumeric(building)) {
                                parser.onKeyValue(curKey, Number(building));
                            } else if (isStringKeyword(building)) {
                                parser.onKeyValue(curKey, keywordToValue(building));
                            } else {
                                parser.onKeyValue(curKey, building);
                            }
                        } else {
                            parser.onKeyValue(curKey, building);
                        }
                        curKey = null;
                    }
                } else if (depthsType[depth] === 1) {
                    if (isNumeric(building)) {
                        parser.onValue(Number(building));
                    } else {
                        parser.onValue(building);
                    }
                }
                inString = false;
                if (stringType === 2) {
                    i -= 1;
                }
            } else {
                building += ch;
            }
        } else if (ch === '\"') {
            inString = true;
            stringType = 0;
            building = '';
        } else if (ch === "'") {
            inString = true;
            stringType = 1;
            building = '';
        } else if (ch === '{') {
            if (depthsType[depth] === 0) {
                if (curKey === null) {
                    throw new Error('Block must have a key at line ' + lineCount + ' offset ' + i);
                }
            }

            parser.onBlock(curKey, 0);

            depthsKey.push(curKey);
            depthsType.push(0);

            curKey = null;
            depth += 1;
        } else if (ch === '}') {
            if (depth === 0) {
                throw new Error('Block mismatch at line ' + lineCount);
            }
            if (depthsType[depth] !== 0) {
                throw new Error('Block mismatch at line ' + lineCount + ' (Expected block type ' + depthsType[depth] + ')');
            }

            tmpStr = depthsKey.pop();

            parser.onEndBlock(tmpStr, 0);

            depthsType.pop();

            depth -= 1;
        } else if (ch === '[') {
            if (depthsType[depth] === 0) {
                if (curKey === null) {
                    throw new Error('Block must have a key at line ' + lineCount);
                }
            }

            parser.onBlock(curKey, 1);

            depthsKey.push(curKey);
            depthsType.push(1);

            curKey = null;
            depth += 1;
        } else if (ch === ']') {
            if (depth === 0) {
                throw new Error('Block mismatch at line ' + lineCount);
            }

            if (depthsType[depth] !== 1) {
                throw new Error('Block mismatch at line ' + lineCount);
            }

            tmpStr = depthsKey.pop();

            parser.onEndBlock(tmpStr, 1);

            depthsType.pop();

            depth -= 1;
        } else if (ch === '\n' || ch === '\r' || ch === ' ' || ch === '\t') {
            if (ch === '\n') {
                lineCount += 1;
            }
            //break;
        } else if (ch === '/' && code.charAt(i + 1) === '/') {
            while (i < code.length && code.charAt(i) !== '\n') {
                i += 1;
            }
            if (code.charAt(i) === '\n') {
                i -= 1;
            }
        } else if (ch === '/' && code.charAt(i + 1) === '*') {
            i += 1;
            while (true) {
                i += 1;
                ch = code.charAt(i);
                if (ch === '*' && code.charAt(i + 1) === '/') {
                    i += 1;
                    break;
                } else if (ch === '\n') {
                    lineCount += 1;
                } else if (i >= code.length) {
                    throw new Error('Comment block is not closed at line ' + lineCount);
                }
            }
        } else {
            inString = true;
            stringType = 2;
            building = '';
            i -= 1;
        }
    }

    if (curKey !== null) {
        throw new Error('Key \"' + curKey + "\" doesn't have a value");
    }

    parser.onFinish();

    //parserGetParentType = null;
};

KeyValue.decode = function (code) {
    'use strict';
    var decoder = new KeyValueDecoder();

    KeyValue.parse(code, decoder);
    return decoder.root;
};

KeyValue.encode = function(obj, compact ,child){
    'use strict';
    let Newline = (compact)? " " : "\n"
	var str = "";
	if  (child){
		for(var i in obj) {
			if(obj[i].constructor == Function) continue;
			str = `"${i}" {\n`;
			for (let j in obj[i]){
				str += '\t'+ encode_KV(j, obj[i][j], 0, false, Newline, "")+`\n`
			}
			str += '}\n';
		}
		return str
    }

    return encode_o(obj, 0, compact, Newline)
}

module.exports = KeyValue;
