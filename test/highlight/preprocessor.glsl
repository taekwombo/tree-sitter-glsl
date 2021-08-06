#define TEST
/*
^ keyword
        ^ variable
*/
#undef TEST
/*
^ keyword
       ^ variable
*/
#if TEST
// <- keyword
    // <- variable
#ifdef TEST
/*
^ keyword
        ^ variable
*/
#ifndef TEST
/*
^ keyword
        ^ variable
*/
#else
/*
^ keyword
*/
#elif 1
/*
^ keyword
      ^ number
*/
#endif
/*
^ keyword
*/
#error No such fn
/*
^ keyword
       ^ string
          ^ string
               ^ string
*/
#pragma vertex
/*
^ keyword
        ^ string
*/
#extension all : enable
/*
^ keyword
           ^ string
                 ^ string
*/
#version 460
/*
^ keyword
         ^ number
*/
#line 55
/*
^ keyword
      ^ number
*/
