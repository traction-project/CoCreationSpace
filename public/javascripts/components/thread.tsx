import * as React from "react";
import Post from "./post";

interface ThreadProps {}

const Thread: React.FC<ThreadProps> = (props) => {
  return (
    <div className="columns" style={{ marginTop: 15 }}>
      <div className="column is-8 is-offset-2 thread">
        <h1 className="title">{db.thread.th_title}</h1>
        <Post post={db.thread.post}></Post>
      </div>        
    </div>
  );
};

export default Thread;

const db = {
  "thread": {
    "id": 1,
    "th_title": "Hilo del mejor concierto",
    "post": {
        "id": 1,
        "created_at": "2020-08-18 15:10:38.275+02",
        "updated_at": "2020-08-18 15:10:38.275+02",
        "title": "Post del video",
        "karma_points": 4,
        "childPosts": [
            {
                "id": 2,
                "created_at": "2020-08-18 15:10:38.275+02",
                "updated_at": "2020-08-18 15:10:38.275+02",
                "title": "Comentario 1",
                "karma_points": 2,
                "childPosts": [
                    {
                        "id": 4,
                        "created_at": "2020-08-18 15:10:38.275+02",
                        "updated_at": "2020-08-18 15:10:38.275+02",
                        "title": "Comentario 4",
                        "karma_points": 2,
                        "user": {
                            "id": 2,
                            "username": "luka",
                            "created_at": "2020-08-18 15:10:38.275+02",
                            "updated_at": "2020-08-18 15:10:38.275+02"
                        },
                        "dataContainer": {
                            "text_content": "Bien dicho"
                        }
                    }
                ],
                "user": {
                    "id": 2,
                    "username": "carlos",
                    "created_at": "2020-08-18 15:10:38.275+02",
                    "updated_at": "2020-08-18 15:10:38.275+02"
                },
                "dataContainer": {
                    "text_content": "Buen video"
                }
            },
            {
                "id": 3,
                "created_at": "2020-08-18 15:10:38.275+02",
                "updated_at": "2020-08-18 15:10:38.275+02",
                "title": "Comentario 2",
                "karma_points": 2,
                "childPosts": [
                    {
                        "id": 5,
                        "created_at": "2020-08-18 15:10:38.275+02",
                        "updated_at": "2020-08-18 15:10:38.275+02",
                        "title": "Comentario 5",
                        "karma_points": 2,
                        "user": {
                            "id": 2,
                            "username": "lebron",
                            "created_at": "2020-08-18 15:10:38.275+02",
                            "updated_at": "2020-08-18 15:10:38.275+02"
                        },
                        "dataContainer": {
                            "text_content": "Bien dicho"
                        }
                    },
                    {
                        "id": 5,
                        "created_at": "2020-08-18 15:10:38.275+02",
                        "updated_at": "2020-08-18 15:10:38.275+02",
                        "title": "Comentario 5",
                        "karma_points": 2,
                        "user": {
                            "id": 2,
                            "username": "pau",
                            "created_at": "2020-08-18 15:10:38.275+02",
                            "updated_at": "2020-08-18 15:10:38.275+02"
                        },
                        "dataContainer": {
                            "text_content": ""
                        }
                    }
                ],
                "user": {
                    "id": 3,
                    "username": "carlos",
                    "created_at": "2020-08-18 15:10:38.275+02",
                    "updated_at": "2020-08-18 15:10:38.275+02"
                },
                "dataContainer": {
                    "text_content": "Me ha encantado"
                }
            }
        ],
        "dataContainer": {
            "text_content": "Mensaje del contenido del video",
            "multimedia": {
                "id": 1,
                "title": "Video Concierto",
                "file": "http://d2pjmukh9qywdn.cloudfront.net/transcoded/45c8ecb1-6af7-4534-b84f-09e8a592d8f7.mpd"
            }
        },
        "user": {
            "id": 1,
            "username": "pepe",
            "created_at": "2020-08-18 15:10:38.275+02",
            "updated_at": "2020-08-18 15:10:38.275+02"
        },
        "userReferenced": [
            {
                "id": 1,
                "username": "pepe",
                "created_at": "2020-08-18 15:10:38.275+02",
                "updated_at": "2020-08-18 15:10:38.275+02"
            }
        ],
        "tags": [
            {
                "id": 1,
                "tagName": "concierto"
            },
            {
                "id": 2,
                "tagName": "música"
            }
        ]
    }
  },
  "posts": {
    "id": 1,
    "created_at": "2020-08-18 15:10:38.275+02",
    "updated_at": "2020-08-18 15:10:38.275+02",
    "title": "Post del video",
    "karma_points": 4
  }
};