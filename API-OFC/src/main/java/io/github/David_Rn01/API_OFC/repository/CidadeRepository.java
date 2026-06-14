package io.github.David_Rn01.API_OFC.repository;

import io.github.David_Rn01.API_OFC.model.Cidade;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CidadeRepository extends JpaRepository<Cidade, Integer> {
   Optional<Cidade> findByNomeIgnoreCaseAndEstadoIgnoreCase(String nome, String estado);

   boolean existsByNomeAndEstado(String nome, String estado);
}
