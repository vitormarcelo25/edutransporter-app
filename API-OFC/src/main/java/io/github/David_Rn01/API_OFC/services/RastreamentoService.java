//package io.github.David_Rn01.API_OFC.services;
//
//import io.github.David_Rn01.API_OFC.dto.LocalizationDTO;
//import lombok.RequiredArgsConstructor;
//import org.springframework.data.redis.core.RedisTemplate;
//import org.springframework.messaging.simp.SimpMessagingTemplate;
//import org.springframework.stereotype.Service;
//
//import java.util.UUID;
//
//@Service
//@RequiredArgsConstructor
//public class RastreamentoService {
////    private final RedisTemplate<String, Object> redisTemplate;
////    private final SimpMessagingTemplate messagingTemplate;
////
////    public void atualizarLocalizacao(LocalizationDTO localizationDTO){
////        //salvar a posição atual do redis
////        redisTemplate.opsForValue().set("motorista: " + localizationDTO.getMotorisId(), localizationDTO); //Pega a localização pelo id do motorista
////
////        //faz a transmissão para os alunos
////        messagingTemplate.convertAndSend("/topic/motorista" + localizationDTO.getMotorisId(), localizationDTO);
////    }
////
////    public Object getPosicaoAtual(UUID motoristaID){
////        return redisTemplate.opsForValue().get("motorista: " + motoristaID);
////    }
//}
