(module
 (type $none_=>_none (func))
 (type $i32_i32_=>_i32 (func (param i32 i32) (result i32)))
 (import "env" "__memory_base" (global $__memory_base i32))
 (global $STACKTOP (mut i32) (i32.const 0))
 (export "__post_instantiate" (func $__post_instantiate))
 (export "_add" (func $_add))
 (func $_add (param $0 i32) (param $1 i32) (result i32)
  ;;@ src/wasm/hello.c:3:0
  (local.set $0
   (i32.add
    (local.get $0)
    (local.get $1)
   )
  )
  (local.get $0)
 )
 (func $__post_instantiate
  (global.set $STACKTOP
   (global.get $__memory_base)
  )
  (drop
   (i32.add
    (global.get $STACKTOP)
    (i32.const 5242880)
   )
  )
 )
)
