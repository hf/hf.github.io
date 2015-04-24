/* Copyright (C) 2014 Mario Ampov, Stojan Dimitrovski, Andrej Kolarovski. All rights reserved. */

RoboL.SemanticAnalyzer = function SemanticAnalyzer () {

  function promenliva(type,name){
    this.type=type; //tip
    this.name=name; //ime
  }

  function proc(arg,name,vars){
    this.name=name; //ime
    this.arg=arg;  //niza argumenti
    this.vars=vars; //promenlivi
  }

  function var_index(name,vars){
    for (var i=0; i<vars.length; i++){
      if (vars[i].name==name) return i;
    }
    return -1;
  }

  function proc_index(name,proceds){
    for (var i=0; i<proceds.length; i++){
      if (proceds[i].name==name) return i;
    }
    return -1;
  }

  function math_exp_check(obj,promenlivi){
    var ops=[obj.leftOperand, obj.rightOperand];
    for (var i=0; i<2; i++){
      if ((ops[i].type!="MATH:EXPRESSION")&&(ops[i].type!="VALUE:NUMBER")&&(ops[i].type!="IDENTIFIER")){
        lista_greski.push("pogresen tip na promenliva vo izrazot");
        br_greski++;
      } else if (ops[i].type=="MATH:EXPRESSION"){
        math_exp_check(ops[i], promenlivi);
      } else if (ops[i].type=="IDENTIFIER"){
        var str=ops[i].value;
        if (str.indexOf(".")==-1){
          var id_num=var_index(ops[i].value,promenlivi);
          if (id_num==-1) {lista_greski.push("ne postoi promenliva so ime "+ops[i].value); br_greski++;}
          else if (promenlivi[id_num].type!="NUMBER"){lista_greski.push("promenlivata "+ops[i].value+" ne e od tip broj"); br_greski++; }
        } else var_pos_check(str,promenlivi);
      }
    }
  }

  function var_pos_check(v,promenlivi){
    var l=v.length;
    var ch;
    if (v[v.length-1]=="x") ch="x";
    else ch="y";
    var st="."+ch;
    var str=v.replace(st,"");
    var id=var_index(str,promenlivi);
    if (id==-1) {
      lista_greski.push("ne postoi promenliva "+str);
      br_greski++;
    }
    else if (promenlivi[id].type!="POSITION"){
      lista_greski.push(str+" ne e od tip pozicija");
      br_greski++;
    }
  }

  function assignment_check(obj,promenlivi){
    var ret="noinit";
    var ind=var_index(obj.varAssigned.value,promenlivi);
    if (ind==-1) {lista_greski.push("promenlivata "+obj.varAssigned.value+" ne e deklarirana"); br_greski++;}
    else {
      switch (obj.value.type){
        case "COMMAND":
          if (obj.value.command=="моменталнапозиција")
            ret="POSITION";
          else ret="DIRECTION";
        break;

        case "MATH:EXPRESSION":
          math_exp_check(obj.value,promenlivi);
          ret="NUMBER";
        break;

        case "VALUE:NUMBER":
          ret="NUMBER";
        break;

        case "IDENTIFIER":
          var name=obj.value.value;
          if (name.indexOf(".")!=-1){
            var_pos_check(name,promenlivi);
            ret="NUMBER";
          } else {
            var id=var_index(name,promenlivi);
            if (id==-1){
              lista_greski.push("nema promenliva "+name);
              br_greski++;
            }
            else ret=promenlivi[id].type;
          }
        break;
      }

    }
    return ret;
  }

  function cond_check(obj,promenlivi,proceduri){
    body(obj,promenlivi,proceduri);
  }

  function cond_exp_check(obj,promenlivi){
    var ltype,rtype;
    var arr=[obj.leftOperand,obj.rightOperand];
    for (var j=0; j<2; j++){
      if (arr[j].type=="IDENTIFIER"){
        var str=arr[j].value;
        if (str.indexOf(".")==-1){
          var id=var_index(arr[j].value,promenlivi);
          if (id==-1){
            lista_greski.push("ne postoi promenliva "+arr[j].value);
            br_greski++;
          }
          else{
            if (j==0) ltype=promenlivi[id].type;
            else rtype=promenlivi[id].type;
          }
        }
        else {
          var_pos_check(str,promenlivi);
          if (j==0) ltype="NUMBER";
          else rtype="NUMBER";
        }
      }
      else{
        if (arr[j].type=="COMMAND"){
          if (arr[j].value=="моменталнапозиција"){
            if (j==0) ltype="POSITION";
            else rtype="POSITION";
          }
          else {
            if (j==0) ltype="DIRECTION";
            else rtype="DIRECTION";
          }
        }
        if (arr[j].type=="VALUE:NUMBER"){
          if (j==0) ltype="NUMBER";
          else rtype="NUMBER";
        }
      }
    }

    if (ltype!=rtype){
      lista_greski.push("ne moze da se sporedi "+ltype+" so "+rtype);
      br_greski++;
    }
  }

  function body(procedure,pr,proceduri){

    var promenlivi=pr;
    for (var i=0; i<procedure.body.length; i++){
      switch (procedure.body[i].type)
      {
        case "LOOP:TIMES":
          if (procedure.body[i].value.type=="IDENTIFIER"){
            var name=procedure.body[i].value.value;
            if (name.indexOf(".")==-1){
              var id=var_index(name,promenlivi);
              if (id==-1){
                lista_greski.push("ne postoi promenliva "+name);
                br_greski++;
              }
              else if (promenlivi[id].type!="NUMBER"){
                lista_greski.push("promenlivata "+name+" ne e od tip broj");
                br_greski++;
              }
            } else var_pos_check(name,promenlivi);
          }
          else if (procedure.body[i].value.type!="VALUE:NUMBER"){
            lista_greski.push("ne e broj");
            br_greski++;
          }
          body(procedure.body[i],promenlivi,proceduri);
        break;

        case "COMMAND":
        break;

        case "VARIABLE":
          for  (var j=0; j<procedure.body[i].variables.length; j++){
            if (var_index(procedure.body[i].variables[j].value,promenlivi)>-1){
              lista_greski.push("promenlivata "+j.value+" e veke deklarirana");
              br_greski++;
            }
            else {
              var prom=new promenliva("noinit",procedure.body[i].variables[j].value);
              promenlivi.push(prom);
            }
          }
        break;

        case "FUNCTION:CALL":
          var name=procedure.body[i].name.value;
          var f_id=proc_index(name,proceduri);
          if (f_id==-1) {lista_greski.push("ne postoi procedura "+name); br_greski++;}
          else {
            if (proceduri[f_id].arg.length!=procedure.body[i].arguments.length){
              lista_greski.push("pogresen broj na argumenti vo povik na "+name);
              br_greski++;
            }
            else
            {
              for (var j=0; j<proceduri[f_id].arg.length; j++){
                var type=proceduri[f_id].arg[j].type;
                if (type!=procedure.body[i].arguments[j].varType){
                  if (procedure.body[i].arguments[j].varType=="VARIABLE"){
                    var str=procedure.body[i].arguments[j].value.value;
                    if (str.indexOf(".")!=-1){
                      var_pos_check(str,promenlivi);
                      if (type!="NUMBER") {
                        lista_greski.push("pogresen tip na argument");
                        br_greski++;
                      }
                    } else {
                      var id=var_index(str,promenlivi);
                      if (id==-1){
                        lista_greski.push("ne postoi promenliva "+str);
                        br_greski++;
                      } else {
                        if (type!=promenlivi[id].type){
                          lista_greski.push(str+" e od pogresen tip");
                          br_greski++;
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        break;

        case "ASSIGNMENT":
          var typ=assignment_check(procedure.body[i],promenlivi);
          if (typ!="noinit"){
            var id=var_index(procedure.body[i].varAssigned.value,promenlivi);
            promenlivi[id].type=typ;
          }
        break;

        case "CONDITION":
          cond_check(procedure.body[i],promenlivi,proceduri);
        break;

        case "CONDITION:EXPRESSION":
          cond_exp_check(procedure.body[i],promenlivi);
          cond_check(procedure.body[i],promenlivi,proceduri);
        break;

        case "LOOP:UNTIL":
          if (procedure.body[i].condition.type=="CONDITION:EXPRESSION"){
            cond_exp_check(procedure.body[i].condition,promenlivi);
          }
          body(procedure.body[i],promenlivi,proceduri);
        break;
      }
    }
  }

  var br_greski=0;
  var proceduri=[];
  var lista_greski=[];

  this.run = function run(ast) {


    for (var i=0; i<ast.procedures.length; i++){
      var ars=[];
      var vars=[]
      for (var j=0; j<ast.procedures[i].arguments.length; j++){
        ars[j]=new promenliva(ast.procedures[i].arguments[j].varType, ast.procedures[i].arguments[j].name.value);
        vars[j]=new promenliva(ast.procedures[i].arguments[j].varType, ast.procedures[i].arguments[j].name.value);
      }
      proceduri[i]=new proc(ars,ast.procedures[i].name.value,vars);
    }



    for (var i=0; i<proceduri.length; i++){
      body(ast.procedures[i],proceduri[i].vars,proceduri);
    }

    lista_greski.push("Broj na greski: "+br_greski);
    for (var i=0; i<lista_greski.length; i++){
      console.log(lista_greski[i]);
    }

    return lista_greski;
  }

}
