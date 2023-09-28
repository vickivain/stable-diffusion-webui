@echo off

set PYTHON=
set GIT=
set VENV_DIR=
set COMMANDLINE_ARGS=--theme dark --no-half-vae --xformers
set PYTORCH_CUDA_ALLOC_CONF=garbage_collection_threshold:0.9,max_split_size_mb:512
set ATTN_PRECISION=fp16
set SAFETENSORS_FAST_GPU=1

call webui.bat