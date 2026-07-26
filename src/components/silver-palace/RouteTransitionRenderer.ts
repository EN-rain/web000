const VERTEX_SHADER = `#version 300 es
in vec2 aPosition;
out vec2 vUv;

void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

const FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform sampler2D tCurrent;
uniform sampler2D tNext;
uniform sampler2D tMudNormal;
uniform float uProgress;
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uCurrentImageSize;
uniform vec2 uNextImageSize;
uniform float uCurrentFitTop;
uniform float uNextFitTop;
uniform float uCurrentEdgeMultiplier;
uniform float uNextEdgeMultiplier;
uniform float uDirection;

in vec2 vUv;
out vec4 outColor;

vec2 scaleUv(vec2 uv, float scale, vec2 center) {
  return (uv - center) / scale + center;
}

vec2 coverUv(
  vec2 uv,
  vec2 imageSize,
  vec2 viewportSize,
  float anchorY
) {
  float imageRatio = imageSize.x / imageSize.y;
  float viewportRatio = viewportSize.x / viewportSize.y;
  vec2 scaled = vec2(1.0);

  if (viewportRatio > imageRatio) {
    scaled.y = imageRatio / viewportRatio;
  } else {
    scaled.x = viewportRatio / imageRatio;
  }

  vec2 offset = vec2(
    (1.0 - scaled.x) * 0.5,
    (1.0 - scaled.y) * clamp(anchorY, 0.0, 1.0)
  );
  return offset + uv * scaled;
}

void main() {
  vec2 uv = vUv;
  float progress = uProgress;
  float direction = uDirection >= 0.0 ? 1.0 : -1.0;
  float easedProgress = mix(
    progress * progress * (3.0 - 2.0 * progress),
    progress,
    0.25
  );

  vec2 currentUv = scaleUv(uv, mix(1.0, 1.3, progress), vec2(0.5));
  vec2 nextUv = scaleUv(uv, mix(1.3, 1.0, progress), vec2(0.5));
  vec2 currentSampleUv = coverUv(
    currentUv,
    uCurrentImageSize,
    uResolution,
    uCurrentFitTop > 0.5 ? 0.0 : 0.5
  );
  vec2 nextSampleUv = coverUv(
    nextUv,
    uNextImageSize,
    uResolution,
    uNextFitTop > 0.5 ? 0.0 : 0.5
  );

  vec4 current = texture(tCurrent, currentSampleUv);
  vec4 next = texture(tNext, nextSampleUv);

  vec3 mudNormal = texture(tMudNormal, uv).rgb;
  float mudStrength = mix(
    0.3,
    0.6,
    0.5 + 0.5 * sin(uTime - uv.x * 10.0)
  );
  float mudOffset = (mudNormal.r - 0.5) * mudStrength;

  float verticalAxis = direction > 0.0 ? uv.y : (1.0 - uv.y);
  float directionalAxis = direction > 0.0 ? uv.x : (1.0 - uv.x);
  float centerMix =
    (1.0 - smoothstep(-0.4, 0.6, abs(uv.x - 0.5))) * 0.5;
  float threshold = mix(verticalAxis, directionalAxis, centerMix);
  threshold = threshold * 2.0 - 1.0;
  threshold = threshold / 1.2 + 0.2 + mudOffset;
  threshold = threshold * 0.5 + 0.5;

  float edge = easedProgress - threshold;
  float edgeDistance = abs(edge);
  float edgeProximity = 1.0 - smoothstep(0.0, 0.3, edgeDistance);

  vec3 currentEdges = vec3(0.0);
  vec3 nextEdges = vec3(0.0);
  if (progress > 0.01 && progress < 0.99) {
    float currentLuma = dot(current.rgb, vec3(0.299, 0.587, 0.114));
    currentEdges = vec3(
      fwidth(currentLuma) *
      mix(5.0, 10.0, easedProgress) *
      uCurrentEdgeMultiplier *
      edgeProximity
    );
    float nextLuma = dot(next.rgb, vec3(0.299, 0.587, 0.114));
    nextEdges = vec3(
      fwidth(nextLuma) *
      mix(3.0, 5.0, 1.0 - easedProgress) *
      uNextEdgeMultiplier *
      edgeProximity
    );
  }

  float antialias = fwidth(edge) * 3.0;
  float blendFactor = smoothstep(-antialias, antialias, edge);
  float currentEdgeStrength =
    smoothstep(0.0, 0.5, easedProgress) * edgeProximity;
  float nextEdgeStrength =
    smoothstep(0.2, 0.8, 1.0 - easedProgress) * edgeProximity;

  current = mix(
    current,
    vec4(currentEdges, 1.0),
    smoothstep(0.0, 0.5, easedProgress) *
      currentEdgeStrength *
      uCurrentEdgeMultiplier
  );
  next = mix(
    next,
    vec4(nextEdges, 1.0),
    smoothstep(0.2, 0.8, 1.0 - easedProgress) *
      nextEdgeStrength *
      uNextEdgeMultiplier
  );

  vec4 outputColor = mix(current, next, blendFactor);
  float transitionActive =
    smoothstep(0.01, 0.08, progress) *
    (1.0 - smoothstep(0.92, 1.0, progress));
  float glowFactor = smoothstep(0.0, 0.003, abs(edge));
  float glowMultiplier = mix(
    2.0,
    10.0,
    0.5 + 0.5 * sin(uTime + uv.x * 10.0)
  );
  float glowMix = (1.0 - glowFactor) * transitionActive;

  outColor = mix(outputColor, outputColor * glowMultiplier, glowMix);
}`;

type Uniforms = {
  progress: WebGLUniformLocation;
  time: WebGLUniformLocation;
  resolution: WebGLUniformLocation;
  currentImageSize: WebGLUniformLocation;
  nextImageSize: WebGLUniformLocation;
};

export type RouteTransitionRenderer = {
  draw: (progress: number, time: number) => void;
  resize: () => void;
  dispose: () => void;
};

function compileShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Unable to create the transition shader.");

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(message ?? "Unable to compile the transition shader.");
  }

  return shader;
}

function requiredUniform(
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  name: string,
) {
  const location = gl.getUniformLocation(program, name);
  if (!location) throw new Error(`Missing transition uniform: ${name}`);
  return location;
}

function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Unable to load ${source}`));
    image.src = source;
  });
}

function createTexture(
  gl: WebGL2RenderingContext,
  image: HTMLImageElement,
  unit: number,
) {
  const texture = gl.createTexture();
  if (!texture) throw new Error("Unable to create a transition texture.");

  gl.activeTexture(gl.TEXTURE0 + unit);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    image,
  );
  return texture;
}

export type RouteTransitionOptions = {
  currentImage: string;
  nextImage: string;
  currentFitTop?: boolean;
  nextFitTop?: boolean;
  currentEdgeMultiplier?: number;
  nextEdgeMultiplier?: number;
  direction?: 1 | -1;
};

export async function createRouteTransitionRenderer(
  canvas: HTMLCanvasElement,
  options: RouteTransitionOptions,
): Promise<RouteTransitionRenderer> {
  const gl = canvas.getContext("webgl2", {
    alpha: false,
    antialias: true,
    powerPreference: "high-performance",
  });
  if (!gl) throw new Error("WebGL 2 is unavailable.");

  const [currentImage, nextImage, mudImage] = await Promise.all([
    loadImage(options.currentImage),
    loadImage(options.nextImage),
    loadImage("/silver-palace/mud_normal.B0pkdfRk.jpg"),
  ]);

  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
  const program = gl.createProgram();
  if (!program) throw new Error("Unable to create the transition program.");

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(
      gl.getProgramInfoLog(program) ?? "Unable to link the transition shader.",
    );
  }
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 3, -1, -1, 3]),
    gl.STATIC_DRAW,
  );
  const position = gl.getAttribLocation(program, "aPosition");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  const textures = [
    createTexture(gl, currentImage, 0),
    createTexture(gl, nextImage, 1),
    createTexture(gl, mudImage, 2),
  ];
  gl.uniform1i(requiredUniform(gl, program, "tCurrent"), 0);
  gl.uniform1i(requiredUniform(gl, program, "tNext"), 1);
  gl.uniform1i(requiredUniform(gl, program, "tMudNormal"), 2);
  gl.uniform1f(
    requiredUniform(gl, program, "uCurrentFitTop"),
    options.currentFitTop ? 1 : 0,
  );
  gl.uniform1f(
    requiredUniform(gl, program, "uNextFitTop"),
    options.nextFitTop ? 1 : 0,
  );
  gl.uniform1f(
    requiredUniform(gl, program, "uCurrentEdgeMultiplier"),
    options.currentEdgeMultiplier ?? 1,
  );
  gl.uniform1f(
    requiredUniform(gl, program, "uNextEdgeMultiplier"),
    options.nextEdgeMultiplier ?? 1,
  );
  gl.uniform1f(
    requiredUniform(gl, program, "uDirection"),
    options.direction ?? 1,
  );

  const uniforms: Uniforms = {
    progress: requiredUniform(gl, program, "uProgress"),
    time: requiredUniform(gl, program, "uTime"),
    resolution: requiredUniform(gl, program, "uResolution"),
    currentImageSize: requiredUniform(gl, program, "uCurrentImageSize"),
    nextImageSize: requiredUniform(gl, program, "uNextImageSize"),
  };

  gl.uniform2f(
    uniforms.currentImageSize,
    currentImage.naturalWidth,
    currentImage.naturalHeight,
  );
  gl.uniform2f(
    uniforms.nextImageSize,
    nextImage.naturalWidth,
    nextImage.naturalHeight,
  );

  const resize = () => {
    const width = Math.max(1, Math.round(canvas.clientWidth));
    const height = Math.max(1, Math.round(canvas.clientHeight));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    gl.viewport(0, 0, width, height);
    gl.uniform2f(uniforms.resolution, width, height);
  };

  const draw = (progress: number, time: number) => {
    resize();
    gl.uniform1f(uniforms.progress, progress);
    gl.uniform1f(uniforms.time, time);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  const dispose = () => {
    textures.forEach((texture) => gl.deleteTexture(texture));
    gl.deleteBuffer(buffer);
    gl.deleteProgram(program);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
  };

  draw(0, 0);
  return { draw, resize, dispose };
}
