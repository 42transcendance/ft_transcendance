let canvas: HTMLCanvasElement | null = null
let gl: WebGLRenderingContext | null = null
let prog: WebGLProgram | null = null
let buf: WebGLBuffer | null = null
let animationFrameId: number | null = null
let start: number | null = null

const vert=`attribute vec2 aPos;void main(){gl_Position=vec4(aPos,0,1);}`
const frag=`
precision highp float;
uniform vec2 uRes;
uniform float uTime;

float hash(float n){return fract(sin(n)*43758.5453);}

void main(){
  vec2 uv=gl_FragCoord.xy/uRes;
  vec2 aspect=vec2(uRes.x/uRes.y,1.);
  vec2 p=(uv-.5)*aspect;

  float angle=atan(p.y,p.x);
  float radius=length(p);

  float PI2=6.28318530718;
  float numLines=60.;

  float t=uTime*7.5;

  float lines=0.;
  for(float i=0.;i<60.;i++){
    float seed=i/60.;
    float baseAngle=(i/numLines)*PI2;
    float offset=(hash(i*1.7+13.3)-.5)*0.18;
    float centerAngle=baseAngle+offset;

    float width=0.003+hash(i*2.1+0.5)*0.018;
    float brightness=0.4+hash(i*3.7+1.2)*0.6;

    float diff=abs(mod(angle-centerAngle+PI2*1.5,PI2)-PI2*.5);
    float line=smoothstep(width,0.,diff);

    float taperStart=0.22+hash(i*5.3+2.)*0.35;
    float taperEnd=taperStart+0.15+hash(i*1.3)*0.2;
    float taper=smoothstep(taperStart,taperEnd,radius);
    
    float lineLength=0.3+hash(i*7.1)*0.45;
    float lengthFade=smoothstep(lineLength+t*0.3,lineLength-0.1,radius);
    
    float outerFade=smoothstep(0.75,0.5,radius);

    lines=max(lines,line*taper*lengthFade*outerFade*brightness);
  }

  float centerMask=1.-smoothstep(0.18,0.32,radius);
  lines*=(1.-centerMask);

  vec3 col=vec3(lines);
  gl_FragColor=vec4(col,lines);
}
`

function compile(src: string, type: number): WebGLShader | null {
  if (!gl) return null
  const s = gl.createShader(type)
  if (!s) return null
  gl.shaderSource(s, src)
  gl.compileShader(s)
  return s
}

function resize() {
  if (!canvas || !gl) return
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const w = Math.floor(canvas.clientWidth * dpr)
  const h = Math.floor(canvas.clientHeight * dpr)
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w
    canvas.height = h
  }
  gl.viewport(0, 0, w, h)
}

function frame(ts: number) {
  if (!start) start = ts
  const t = (ts - start) / 1000
  
  resize()
  
  if (gl && prog) {
    const uRes = gl.getUniformLocation(prog, 'uRes')
    const uTime = gl.getUniformLocation(prog, 'uTime')
    
    gl.uniform2f(uRes, canvas!.width, canvas!.height)
    gl.uniform1f(uTime, t)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }
  
  animationFrameId = requestAnimationFrame(frame)
}

export function initShader() {
  canvas = document.querySelector('.shader-canvas') as HTMLCanvasElement
  if (!canvas) {
    console.error('Canvas not found')
    return
  }

  gl = canvas.getContext('webgl', { alpha: true, preserveDrawingBuffer: true })
  if (!gl) {
    console.error('WebGL not supported')
    return
  }

  prog = gl.createProgram()
  if (!prog) return

  gl.attachShader(prog, compile(vert, gl.VERTEX_SHADER)!)
  gl.attachShader(prog, compile(frag, gl.FRAGMENT_SHADER)!)
  gl.linkProgram(prog)
  gl.useProgram(prog)

  buf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)

  const loc = gl.getAttribLocation(prog, 'aPos')
  gl.enableVertexAttribArray(loc)
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

  start = null
  animationFrameId = requestAnimationFrame(frame)
}

export function cleanupShader() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }

  if (gl && prog) {
    gl.deleteProgram(prog)
    prog = null
  }

  if (gl && buf) {
    gl.deleteBuffer(buf)
    buf = null
  }

  gl = null
  canvas = null
  start = null
}