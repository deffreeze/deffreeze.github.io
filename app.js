(function(){
  var L = window.L || {};
  function $(id){return document.getElementById(id);}
  function gpu(){
    try{
      var c=document.createElement("canvas");
      var gl=c.getContext("webgl")||c.getContext("experimental-webgl");
      if(!gl) return "N/A";
      var e=gl.getExtension("WEBGL_debug_renderer_info");
      var r=e?gl.getParameter(e.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER);
      return (r||"WebGL").toString().slice(0,42);
    }catch(err){return "N/A";}
  }
  function fillDevice(){
    $("d_cores").textContent = navigator.hardwareConcurrency || "?";
    $("d_mem").textContent = navigator.deviceMemory ? (navigator.deviceMemory+" GB") : "?";
    $("d_gpu").textContent = gpu();
    $("d_screen").textContent = screen.width+"x"+screen.height+" @"+(window.devicePixelRatio||1)+"x";
  }
  var raf=0, frames=0, t0=0, cur=0, sum=0, n=0, mn=1e9, mx=0, hzMax=0, running=false;
  function loop(t){
    frames++;
    if(!t0){t0=t;}
    var dt=t-t0;
    if(dt>=500){
      cur=Math.round(frames*1000/dt);
      sum+=cur; n++; if(cur<mn)mn=cur; if(cur>mx)mx=cur; if(cur>hzMax)hzMax=cur;
      $("f_cur").textContent=cur;
      $("f_avg").textContent=Math.round(sum/n);
      $("f_min").textContent=(mn===1e9?"-":mn);
      $("f_max").textContent=mx;
      $("f_hz").textContent=hzMax;
      frames=0; t0=t;
    }
    if(running) raf=requestAnimationFrame(loop);
  }
  function verdict(){
    var cores=navigator.hardwareConcurrency||0, mem=navigator.deviceMemory||0, fps=mx||cur||0;
    var tier;
    if(cores>=8 && mem>=8 && fps>=85) tier=L.t_high;
    else if(cores>=6 && (mem>=6||mem===0) && fps>=50) tier=L.t_main;
    else tier=L.t_entry;
    $("v_out").innerHTML = (L.v_pre||"")+" <b>"+tier+"</b>. "+(L.v_post||"");
  }
  function stop(){running=false; cancelAnimationFrame(raf); $("btn").textContent=L.measure; verdict();}
  function start(){
    if(running){stop();return;}
    frames=0;t0=0;cur=0;sum=0;n=0;mn=1e9;mx=0;hzMax=0;running=true;
    $("btn").textContent=L.stop;
    raf=requestAnimationFrame(loop);
    setTimeout(function(){ if(running) stop(); }, 5200);
  }
  document.addEventListener("DOMContentLoaded", function(){
    try{ fillDevice(); }catch(e){}
    var b=$("btn"); if(b) b.addEventListener("click", start);
  });
})();
