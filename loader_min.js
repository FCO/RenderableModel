var a="Depender.js";var v="0.2";if(localStorage){var b=document.createElement("script");var c=localStorage.getItem(a+"_"+v);document.body.appendChild(b);if(c){b.innerHTML=c}else{var d=new XMLHttpRequest();if(d){d.open("GET",a,false);d.send(null);content=d.responseText}b.innerHTML=content;localStorage.setItem(a,content);}}else{window.setVersion=function(){};window.depends=new Function("data","callback","for(var url in data) {var b = document.createElement('b');b.src = url;document.body.appendChild(b);}callback();"); }
