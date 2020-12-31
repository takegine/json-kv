var kv = require('../index'),
assert = require('assert');

// TEST DATA
var simple_object = {a : 1},
    complex_object = {
        name: "Some Name",
        age: 30,
        location: [1.34, 5.53],
        obj: simple_object,
        married: false,
        working: true,
        interests: [
            {
                title: "Some 1",
                num: 1
            },
            {
                title: "Some 2",
                num: 1
            }
        ]
    },
    complex_object_encoded_a = '"kv"  {\n\t"name" "Some Name"\n\t"age" 30\n\t"location"  [\n\t\t1.34\n\t\t5.53\n\n\t\t]\n\t"obj"  {\n\t\t"a" 1\n\n\t\t}\n\t"married" false\n\t"working" true\n\t"interests"  [\n\t\t {\n\t\t\t"title" "Some 1"\n\t\t\t"num" 1\n\n\t\t\t}\n\t\t {\n\t\t\t"title" "Some 2"\n\t\t\t"num" 1\n\n\t\t\t}\n\n\t\t]\n\n\t}\n';
    complex_object_encoded_b = '\tkv  { \tname "Some Name" \tage 30 \tlocation  [ \t1.34 \t5.53  \t] \tobj  { \ta 1  \t} \tmarried false \tworking true \tinterests  [ \t { \ttitle "Some 1" \tnum 1  \t} \t { \ttitle "Some 2" \tnum 1  \t}  \t]  \t}    ';
    complex_object_encoded_c = '"kv" {\n      "name" "Some Name"\n\n      "age" 30\n\n        "location"  [\n\t1.34\n\t5.53\n\n\t]\n\n      "obj"  {\n\t"a" 1\n\n\t}\n\n      "married" false\n\n "working" true\n\n  "interests"  [\n\t {\n\t\t"title" "Some 1"\n\t\t"num" 1\n\n\t\t}\n\t {\n\t\t"title" "Some 2"\n\t\t"num" 1\n\n\t\t}\n\n\t]\n\n}\n';
    complex_object_encoded_d = '"kv" {\n      "name" "Some Name" \n  "age" 30 \n   "location"  [ \t1.34 \t5.53  \t] \n     "obj"  { \t"a" 1  \t} \n  "married" false \n    "working" true \n     "interests"  [ \t { \t\t"title" "Some 1" \t\t"num" 1  \t\t} \t { \t\t"title" "Some 2" \t\t"num" 1  \t\t}  \t] \n}\n';


exports['test KeyValue#decode'] = function () {
    assert.eql(simple_object, kv.decode('a 1\n'));
    // FIXME: Failing right now
    //assert.eql(simple_object, kv.decode('a 1'));
    assert.eql(complex_object, kv.decode(complex_object_encoded));
    assert.eql(complex_object, kv.decode(complex_object_encoded_compact));
};

exports['test KeyValue#encode'] = function () {
    assert.eql(complex_object_encoded_a, kv.encode(complex_object));
    assert.eql(complex_object_encoded_b, kv.encode(complex_object, true));
};

// console.log(
//     complex_object_encoded_a===kv.encode({kv:complex_object}, false,false),
//     complex_object_encoded_b===kv.encode({kv:complex_object},  true,false),
//     complex_object_encoded_c===kv.encode({kv:complex_object}, false, true),
//     complex_object_encoded_d===kv.encode({kv:complex_object},  true, true)
//     )


// // console.log( kv.encode({kv:complex_object},false,false),'\n')
// // console.log( kv.encode({kv:complex_object}, true,false),'\n')
// // console.log( kv.encode({kv:complex_object},false, true),'\n')
// // console.log( kv.encode({kv:complex_object}, true, true),'\n')
