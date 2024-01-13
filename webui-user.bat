@echo off

set PYTHON=
set GIT=
set VENV_DIR=
set COMMANDLINE_ARGS=--theme dark --no-half-vae --opt-sdp-no-mem-attention --xformers --skip-python-version-check --api
set PYTORCH_CUDA_ALLOC_CONF=garbage_collection_threshold:0.9,max_split_size_mb:64
set OPTIMIZED_TURBO=true
set ATTN_PRECISION=fp16
set SAFETENSORS_FAST_GPU=1
git pull

call webui.bat