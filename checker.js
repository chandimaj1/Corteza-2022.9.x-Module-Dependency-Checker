let modules_json = require('./corteza_json_exports/module-export.json');
const modules = modules_json.list;

let workflows_json = require('./corteza_json_exports/workflows-export.json');
const workflows = workflows_json.workflows;

let pages_json = require('./corteza_json_exports/pages-export.json');
const pages = pages_json.response.set;

const fs = require('fs');

let html = "";
let results = {};

// All Modules
modules.every(mod => {
    
    let mID = mod.moduleID;
    let mName = mod.name;
    let mHandle = mod.handle;
    let relModules = [];
    let relWorkflows = [];
    let relPages = [];


    // Other modules having references to this module
    modules.every(oMod => {
        if (oMod.moduleID!==mID && oMod.fields.length>0){
            let fields = [];

            oMod.fields.every(field =>{
                if(field.kind=="Record" && field.options.moduleID==mID){
                    fields.push(field.name);
                }
                return true;
            });

            (fields.length>0)?relModules.push("Module:"+oMod.handle+"("+oMod.moduleID+"); fields:"+`${fields}`):false;
        }
        return true;
    });


    // Workflows having references to this module
    workflows.every( wf => {
        let steps = [];
        let triggers = [];

        // check steps
        if (wf.steps && wf.steps.length>0){
            wf.steps.every( step => {
                if (step.arguments && step.arguments.length>0){
                    step.arguments.every( arg => {
                        if (
                            (arg.target=="module" && arg.type=="Handle" && arg.value==mHandle) ||
                            (arg.target=="module" && arg.type=="ID" && arg.value==mID)
                        ){
                            steps.push("StepID: "+step.stepID);
                        }
                        return true;
                    });
                }
                return true;
            });
        }
        
        // check triggers
        if (wf.triggers && wf.triggers.length>0){
            wf.triggers.every( trigger => {
                trigger.constraints.every( trigger_const => {
                    if (trigger_const.name=="module" && (trigger_const.values.indexOf(mHandle) !== -1) ){
                        triggers.push ("StepID: "+trigger.stepID+" Enabled:"+trigger.enabled);
                    }
                    return true;
                });
                return true;
            });
        }
        (steps.length>0 || triggers.length>0)?relWorkflows.push("Handle:"+wf.handle+"; Steps:"+`${steps}`+"; Triggers:"+`${triggers}`):false;
        return true;
    });


    // Related Pages
    pages.every( page => {
        let blocks = [];
        if (page.blocks && page.blocks.length>0){
            page.blocks.every( block => {
                if (block.kind=="RecordList" && block.options.moduleID==mID){
                    blocks.push("Block Title:"+block.title)
                    //relPages.push(page.title + "(" + page.pageID + ") ");
                }
                return true;
            });
        }
        (blocks.length>0)?relPages.push("Page:"+page.title+"("+page.pageID+"); blocks:"+`${blocks}`):false;
        return true;
    });

    //html = html + "<tr><td>"+mID+"</td><td>"+mName+"</td><td>"+mHandle+"</td><td>"+`${relModules}`+"</td><td>"+`${relWorkflows}`+"</td><td>"+`${relPages}`+"</td></tr>";
    html = html + "<tr><td>"+mID+"</td><td>"+mName+"</td><td>"+mHandle+"</td><td>"+relModules.join([separator = '<br/>'])+"</td><td>"+relWorkflows.join([separator = '<br/>'])+"</td><td>"+relPages.join([separator = '<br/>'])+"</td></tr>";
   // console.log(relPages);
   return true;
});

let xxx = "<table>"+html+"</table>";

fs.writeFile('Output.txt', xxx, (err) => {
    if (err) throw err;
});

//console.log(xxx);
//document.getElementById("xxxx").innerHTML=xxx;