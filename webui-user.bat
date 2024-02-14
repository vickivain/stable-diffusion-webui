@echo off

set PYTHON=
set GIT= git config --global --add safe.directory G:/stable-diffusion-webui
set VENV_DIR=
set PYTORCH_CUDA_ALLOC_CONF=garbage_collection_threshold:0.9,max_split_size_mb:64
set COMMANDLINE_ARGS=--theme dark  --refetch --no-auto-gc --no-half --no-half-vae --opt-sdp-no-mem-attention --xformers --skip-python-version-check
set OPTIMIZED_TURBO=true
set ATTN_PRECISION=fp16
set SAFETENSORS_FAST_GPU=1

call webui.bat