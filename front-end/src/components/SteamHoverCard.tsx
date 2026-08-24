import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import type { myGamesApiInterface } from "@/interfaces/gameDataTypes";
import { Button } from "@mui/material";
import { FaEraser } from "react-icons/fa";
import AttGameModal from "./jogados/modalAttJogo";
import { Link } from "react-router";

interface Props {
  game: myGamesApiInterface;
  deletajooj?: (id: string, backgroundImage?: string) => Promise<void>;
  uidValidator?: string;
}

export default function SteamHoverCard({ game, deletajooj, uidValidator }: Props) {
  const [hovered, setHovered] = useState(false);
  const [selected, setSelected] = useState(false);

  const isOpen = hovered || selected;
  // console.log(hovered, selected)
  return (
    <>
      {/* BACKDROP */}

      <AnimatePresence>
        {hovered && (
          <motion.div // blur de fundo
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="
              fixed
              inset-0
              bg-black/20
              backdrop-blur-[2px]
              z-40
              pointer-events-none
            "
          />
        )}
      </AnimatePresence>

      {/* CARD */}

      <motion.div

        onClick={() => { setSelected(prev => !prev) }}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        className={`
          relative
          w-auto
          ${selected ? 'cursor-zoom-out' : 'cursor-zoom-in'}
          z-50
        `}
        // animate={{
        //   scale: isOpen ? 1.15 : 1
        // }}
        whileHover={{
          scale: 1.10,
        }}
        transition={{
          duration: 0.25,
        }}
      >
        <div className="h-64 relative">
          <Link to={`/home/jogos/${game.id}`}>
            <img
              src={game.background_image ?? ''}
              alt={game.name ?? 'cover'}
              className="
                w-full
                h-full
                object-center
                object-cover
                rounded-xl
              "
            />
          </Link>

          {/* Fade branco */}

          <motion.div
            animate={{
              opacity: isOpen ? 0.5 : 0,
            }}
            className="
            absolute
            inset-0
            bg-black/30
            rounded-xl
          "
          />

          {/* Infos */}

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: 50,
                }}
                animate={{
                  opacity: 1,
                  y: 5, // na hora que sobe, o tanto que fica para baixo
                  transition: {
                    delay: 0
                  }
                }}
                exit={{
                  opacity: 0,
                  y: 20, // na hora que sai, o tanto que fica para baixo
                  transition: {
                    delay: 0,
                  }
                }}
                className={
                  `
                absolute
                bottom-0
                left-0
                right-0
                p-4
                bg-linear-to-t
                from-black
                via-black/80
                to-transparent
                rounded-b-xl
                
                `
                }
              >
                <div className="flex justify-between items-center">
                  <p className=" text-white/85">{game.platform}</p>

                  <div className={`${uidValidator === 'LmUiBeD97qW9Ft2FzJfnEMHKzXK2' ? 'hidden' : 'flex'} gap-2`}> 
                    {deletajooj && (
                      <Button className='bg-white/60' onClick={() => deletajooj(game.id, game.background_image)}>
                        <FaEraser className="h-5 w-5 text-red-600/80" />
                      </Button>
                    )}
                    <AttGameModal gameId={game.id} data={game} />
                  </div>
                </div>

                <p className=" text-white/85">{String(game.hours_played ?? '0')} horas</p>

                <p className=" text-white/85">{String(game.hours_expected ?? '0')} horas esperadas</p>

                <p className=" text-white/85">Status: {game.status}</p>
                <p className=" text-white/85">Gênero: {game.genre}</p>
                <p className=" text-white/85">Prioridade: {game.priority}</p>

                {/* <p>{game.status}</p> */}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <h2 className="font-bold text-sm text-white/85 mt-2">
          {`${game.name} (${game.release_year ?? ''})`}
        </h2>
      </motion.div>
    </>
  );
}