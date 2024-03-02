@echo off

set PYTHON=
set GIT=
set VENV_DIR=
set PYTORCH_CUDA_ALLOC_CONF=garbage_collection_threshold:0.9,max_split_size_mb:64
set COMMANDLINE_ARGS=--theme dark --allow code --skip-torch-cuda-test --no-half-vae --opt-sdp-no-mem-attention --xformers set --autolaunch --skip-python-version-check --api
set OPTIMIZED_TURBO=true
set ATTN_PRECISION=fp16
set SAFETENSORS_FAST_GPU=1

call webui.bat